import { NextRequest, NextResponse } from 'next/server';
import { sendLineReplyMessage } from '@/lib/lineMessagingService';
import {
  getLineUserBinding,
  bindLineUserToHn,
  findPatientByHnOrCidInHosxp,
  findStaffInHosxp,
  fetchPatientUpcomingAppointmentsFromHosxp,
  getPatientLatestLabAndVitals,
  recordIncomingLineMessage,
  verifyPatientBirthYear,
  getActiveBindingCountForHn,
} from '@/lib/lineUserService';
import { notifyStaffOnIncomingPatientMessage } from '@/lib/staffNotificationService';
import {
  createRoleSelectionFlexMessage,
  createPatientRegistrationPromptFlex,
  createStaffRegistrationPromptFlex,
  createRegistrationSuccessFlex,
  createMyAppointmentsFlex,
  createConfirmSuccessFlex,
  createRescheduleRequestFlex,
  createContactStaffFlex,
  createPreparationGuideFlex,
  createHealthEducationMenuFlex,
  createDietAdviceFlex,
  createMedicationAdviceFlex,
  createPatientInfoVerificationFlex,
  createRiskAssessmentAndMenuFlex,
  createGeneralWellnessFlexMessage,
  createPatientVitalsFlex,
  createPdpaPinPromptFlex,
  createPharmacistFormPromptFlex,
  createContactPharmacistFlex,
  createStressAndSleepAdviceFlex,
  createThaiMedicineAdviceFlex,
  createContactMentalHealthStaffFlex,
  createExerciseAdviceFlex,
  createEmergencySymptomsFlex,
  createContactPhysicalTherapyFlex,
  createBirthYearVerificationPromptFlex,
  createMaxBindingReachedFlex,
} from '@/lib/lineFlexTemplates';

const pendingVerificationStore = new Map<string, { hn: string; patientName: string; userRole: 'patient' | 'caregiver' }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const events = body.events || [];

    // Fast 200 OK response for LINE Developers "Verify" button test
    if (!events || events.length === 0) {
      return NextResponse.json({ status: 'ok', message: 'LINE Webhook endpoint verified successfully' }, { status: 200 });
    }

    console.log(`📩 LINE Webhook Received ${events.length} event(s)`);

    // Supabase conversation-log writes for each incoming message are kicked
    // off without blocking the reply (LINE's replyToken is short-lived and
    // single-use — nothing non-essential should delay sendLineReplyMessage),
    // but still awaited together before the function returns, since a truly
    // unawaited promise can get dropped when the serverless invocation ends.
    const pendingLogWrites: Promise<any>[] = [];

    for (const event of events) {
      const lineUserId = event.source?.userId;
      const replyToken = event.replyToken;

      console.log(`💬 Event type: ${event.type}, userId: ${lineUserId}, text: ${event.message?.text}`);

      if (!replyToken || !lineUserId) continue;

      // Handle Follow event (When user adds LINE OA)
      if (event.type === 'follow') {
        const flexMsg = createRoleSelectionFlexMessage();
        const res = await sendLineReplyMessage(replyToken, [flexMsg]);
        console.log('📤 Reply follow result:', res);
        continue;
      }

      // Handle Message event
      if (event.type === 'message' && event.message.type === 'text') {
        const text = event.message.text.trim();

        // Save incoming patient message + replyToken to conversation log for Reply web portal
        // replyToken stored in Supabase patient_line_users so staff can use free LINE Reply API.
        // Not awaited here — queued and awaited after the reply is sent (see pendingLogWrites
        // above), so this Supabase write can never delay sendLineReplyMessage below.
        pendingLogWrites.push(
          recordIncomingLineMessage(lineUserId, text, replyToken)
            .then(async (msg) => {
              if (
                msg &&
                !text.startsWith('REGISTER_') &&
                !text.toUpperCase().startsWith('STAFF-') &&
                !text.toUpperCase().startsWith('PIN-')
              ) {
                let category = '💬 ข้อความสอบถามทั่วไป';
                if (text.includes('กายภาพบำบัด')) category = '📅 งานกายภาพบำบัด';
                else if (text.includes('ปรึกษายา') || text.includes('เภสัช')) category = '💊 งานเภสัชกรรม';
                else if (text.includes('สุขภาพจิต') || text.includes('ความเครียด')) category = '🧠 งานสุขภาพจิต';
                else if (text.includes('เลื่อนนัด') || text.includes('นัดหมาย')) category = '🗓️ ขอนัดหมาย/เลื่อนนัด';

                await notifyStaffOnIncomingPatientMessage({
                  lineUserId,
                  hn: msg.hn,
                  patientName: msg.patientName,
                  text,
                  category,
                }).catch((err) => console.warn('⚠️ Staff alert failed:', err));
              }
            })
            .catch((err) => console.warn('⚠️ Failed to record incoming LINE message:', err))
        );

        // --------------------------------------------------------
        // Rich Menu 6 Tile Interactions
        // --------------------------------------------------------
        // Tile 1: "นัดหมายของฉัน" -> Dynamic HOSxP Lookup by lineUserId
        if (text === 'นัดหมายของฉัน' || text.includes('เช็คนัด') || text.includes('วันนัด')) {
          const binding = await getLineUserBinding(lineUserId);

          if (binding) {
            // Patient already linked -> Fetch real HOSxP/Supabase appointments for their HN
            const appointments = await fetchPatientUpcomingAppointmentsFromHosxp(binding.hn);
            if (appointments && appointments.length > 0) {
              const flex = createMyAppointmentsFlex(binding.patientName, binding.hn, appointments);
              await sendLineReplyMessage(replyToken, [flex]);
            } else {
              await sendLineReplyMessage(replyToken, [
                {
                  type: 'text',
                  text: `🗓️ คุณ${binding.patientName} (${binding.hn})\nท่านยังไม่มีรายการนัดหมายตรวจติดตามถัดไปในระบบโรงพยาบาลคลองหาด ณ ขณะนี้ค่ะ\n\nหากต้องการสอบถาม หรือนัดหมายเพิ่มเติม กรุณากดปุ่ม [ติดต่อเจ้าหน้าที่] ได้เลยค่ะ`,
                },
              ]);
            }
          } else {
            // Unregistered patient -> Prompt registration card
            const promptFlex = createPatientRegistrationPromptFlex();
            await sendLineReplyMessage(replyToken, [
              {
                type: 'text',
                text: '⚠️ ยังไม่พบข้อมูลลงทะเบียนในระบบ กรุณากดลงทะเบียนระบุ HN หรือเลขบัตรประชาชนก่อนเพื่อความปลอดภัย 100% ค่ะ',
              },
              promptFlex,
            ]);
          }
          continue;
        }

        // Tile 2: "ยืนยันนัด"
        if (text === 'ยืนยันนัด' || text.includes('ยืนยันมาตามนัด')) {
          const binding = await getLineUserBinding(lineUserId);
          if (binding) {
            const appointments = await fetchPatientUpcomingAppointmentsFromHosxp(binding.hn);
            if (appointments && appointments.length > 0) {
              const realDate = appointments[0].appointmentDate;
              const flex = createConfirmSuccessFlex(binding.patientName, realDate);
              await sendLineReplyMessage(replyToken, [flex]);
            } else {
              await sendLineReplyMessage(replyToken, [
                {
                  type: 'text',
                  text: `🗓️ คุณ${binding.patientName} (${binding.hn})\nท่านยังไม่มีรายการนัดหมายคงเหลือในระบบให้ยืนยันนัด ณ ขณะนี้ค่ะ`,
                },
              ]);
            }
          } else {
            const promptFlex = createPatientRegistrationPromptFlex();
            await sendLineReplyMessage(replyToken, [
              {
                type: 'text',
                text: '⚠️ ยังไม่พบข้อมูลลงทะเบียนในระบบ กรุณากดลงทะเบียนระบุ HN หรือเลขบัตรประชาชนก่อนค่ะ',
              },
              promptFlex,
            ]);
          }
          continue;
        }

        // Tile 3: "ขอเลื่อนนัด"
        if (text === 'ขอเลื่อนนัด' || text.includes('เลื่อนวันนัด')) {
          const flex = createRescheduleRequestFlex();
          await sendLineReplyMessage(replyToken, [flex]);
          continue;
        }

        // 🚨 อาการฉุกเฉินที่ต้องพบแพทย์ทันที — ตรวจก่อนทุก Tile (highest priority)
        if (
          text.includes('ฉุกเฉิน') ||
          text.includes('เจ็บหน้าอก') ||
          text.includes('หมดสติ') ||
          text.includes('ชัก') ||
          text.includes('หอบเหนื่อย') ||
          text.includes('ปวดศีรษะรุนแรง') ||
          text.includes('อ่อนแรง') ||
          text.includes('ปากเบี้ยว') ||
          text.includes('อาการฉุกเฉิน') ||
          text.includes('อาการที่ต้องพบแพทย์') ||
          text === 'ฉุกเฉิน'
        ) {
          const flex = createEmergencySymptomsFlex();
          await sendLineReplyMessage(replyToken, [flex]);
          continue;
        }

        // Tile 4: "ติดต่อเจ้าหน้าที่"
        if (
          text === 'คุยกับเภสัชกร' ||
          text.includes('เภสัช') ||
          text.includes('ห้องยา')
        ) {
          const flex = createContactPharmacistFlex();
          await sendLineReplyMessage(replyToken, [flex]);
          continue;
        }

        if (
          text === 'ติดต่อเจ้าหน้าที่' ||
          text.includes('คุยกับพยาบาล') ||
          text.includes('พยาบาล') ||
          text.includes('นักโภชนา') ||
          text.includes('โภชนาการ')
        ) {
          const flex = createContactStaffFlex();
          await sendLineReplyMessage(replyToken, [flex]);
          continue;
        }

        // Tile 5: "การเตรียมตัวก่อนพบแพทย์"
        if (text === 'การเตรียมตัวก่อนพบแพทย์' || text.includes('เตรียมตัว') || text.includes('งดน้ำ')) {
          const flex = createPreparationGuideFlex();
          await sendLineReplyMessage(replyToken, [flex]);
          continue;
        }

        // Sub-Tile 6.1: "คำแนะนำการรับประทานอาหาร"
        if (
          text === 'คำแนะนำการรับประทานอาหาร' ||
          text.includes('รับประทานอาหาร')
        ) {
          const flex = createDietAdviceFlex();
          await sendLineReplyMessage(replyToken, [flex]);
          continue;
        }

        // Sub-Tile 6.2: "คำแนะนำการใช้ยา"
        if (
          text === 'คำแนะนำการใช้ยา' ||
          text.includes('การใช้ยา') ||
          text.includes('ข้อควรระวัง') ||
          text.includes('ปรึกษายา')
        ) {
          const flex = createMedicationAdviceFlex();
          await sendLineReplyMessage(replyToken, [flex]);
          continue;
        }

        // Sub-Tile 6.2.1: "แบบฟอร์มข้อมูลคนไข้สำหรับประกอบการปรึกษากับเภสัช"
        if (
          text === 'แบบฟอร์มข้อมูลคนไข้สำหรับประกอบการปรึกษากับเภสัช' ||
          text.includes('แบบฟอร์มข้อมูลคนไข้') ||
          text.includes('ประกอบการปรึกษากับเภสัช') ||
          text.includes('แบบฟอร์มปรึกษาเภสัช')
        ) {
          const flex = createPharmacistFormPromptFlex();
          await sendLineReplyMessage(replyToken, [flex]);
          continue;
        }

        // Sub-Tile 6.2.2: "คำแนะนำแพทย์แผนไทย"
        if (
          text === 'คำแนะนำแพทย์แผนไทย' ||
          text.includes('แพทย์แผนไทย') ||
          text.includes('นวดแผนไทย') ||
          text.includes('อบสมุนไพร') ||
          text.includes('ยาสมุนไพร')
        ) {
          const flex = createThaiMedicineAdviceFlex();
          await sendLineReplyMessage(replyToken, [flex]);
          continue;
        }

        if (
          text.includes('ติดต่อแพทย์แผนไทย') ||
          text.includes('จองคิวแพทย์แผนไทย')
        ) {
          await sendLineReplyMessage(replyToken, [
            {
              type: 'text',
              text: '🌿 ติดต่อ/จองคิวบริการแพทย์แผนไทย\n\nกลุ่มงานแพทย์แผนไทยและการแพทย์ทางเลือก โรงพยาบาลคลองหาด\nให้บริการ: นวดรักษา, ประคบสมุนไพร, อบสมุนไพรสด, ทับหม้อเกลือ และจ่ายยาสมุนไพร\n\n📞 โทรติดต่อจองคิว: 06-2271-0099\n⏰ ในเวลาราชการ (จันทร์ - ศุกร์ 08:00 - 16:00 น.)',
            },
          ]);
          continue;
        }

        // Sub-Tile 6.3.1: "ติดต่อเจ้าหน้าที่งานสุขภาพจิตและยาเสพติด"
        if (
          text === 'ติดต่อเจ้าหน้าที่สุขภาพจิต' ||
          text === 'ปรึกษาสุขภาพจิต' ||
          text.includes('ปรึกษาสุขภาพจิต') ||
          text.includes('ยาเสพติด') ||
          text.includes('ติดต่อสุขภาพจิต') ||
          text.includes('ติดต่อเจ้าหน้าที่สุขภาพจิต')
        ) {
          const flex = createContactMentalHealthStaffFlex();
          await sendLineReplyMessage(replyToken, [flex]);
          continue;
        }

        // Sub-Tile 6.3: "คำแนะนำประเมินสุขภาพจิต (รวมความเครียดและการนอน)"
        if (
          text === 'คำแนะนำประเมินสุขภาพจิต' ||
          text === 'ประเมินสุขภาพจิต' ||
          text.includes('ประเมินสุขภาพจิต') ||
          text.includes('คำแนะนำประเมินสุขภาพจิต') ||
          text.includes('ความเครียดและการนอน') ||
          (text.includes('สุขภาพจิต') && !text.includes('ติดต่อ')) ||
          text.includes('ความเครียด') ||
          text.includes('การนอนหลับ')
        ) {
          const flex = createStressAndSleepAdviceFlex();
          await sendLineReplyMessage(replyToken, [flex]);
          continue;
        }

        // Sub-Tile 6.4: "การออกกำลังกายส่งเสริมสุขภาพ"
        if (
          text === 'คำแนะนำการออกกำลังกาย' ||
          text.includes('ออกกำลังกาย') ||
          text.includes('ส่งเสริมสุขภาพ')
        ) {
          const flex = createExerciseAdviceFlex();
          await sendLineReplyMessage(replyToken, [flex]);
          continue;
        }

        // Sub-Tile 6.4.1: "นัดหมายกายภาพบำบัด"
        if (
          text.includes('นัดหมายกายภาพบำบัด') ||
          text.includes('กายภาพบำบัด')
        ) {
          const flex = createContactPhysicalTherapyFlex();
          await sendLineReplyMessage(replyToken, [flex]);
          continue;
        }

        // PIN Verification for PDPA Protected Vitals & Lab Results (e.g. PIN-1234 or 4 digits)
        const isPinInput = text.toUpperCase().startsWith('PIN-') || (text.length === 4 && /^\d{4}$/.test(text));
        if (isPinInput) {
          const pinDigits = text.replace(/[^0-9]/g, '');
          const binding = await getLineUserBinding(lineUserId);

          if (!binding) {
            await sendLineReplyMessage(replyToken, [
              {
                type: 'text',
                text: '⚠️ บัญชี LINE ของท่านยังไม่ได้ผูกกับระบบผู้ป่วย กรุณาพิมพ์เลขบัตรประชาชน หรือ HN 13 หลักเพื่อลงทะเบียนก่อนค่ะ',
              },
            ]);
            continue;
          }

          const patientMatch = await findPatientByHnOrCidInHosxp(binding.hn);
          const rawCid = (patientMatch?.cid || '').replace(/[^0-9]/g, '');
          const last4Cid = rawCid.slice(-4);

          if (pinDigits && last4Cid && pinDigits === last4Cid) {
            const vitals = await getPatientLatestLabAndVitals(binding.hn);
            const vitalsFlex = createPatientVitalsFlex(
              binding.patientName || patientMatch.patientName,
              binding.hn,
              vitals
            );
            await sendLineReplyMessage(replyToken, [
              {
                type: 'text',
                text: `🔓 ยืนยันรหัส PIN สดจาก HOSxP เรียบร้อยแล้วค่ะ!\nแสดงผลตรวจสุขภาพและผลแล็บล่าสุดของ คุณ${binding.patientName}`,
              },
              vitalsFlex,
            ]);
          } else {
            await sendLineReplyMessage(replyToken, [
              {
                type: 'text',
                text: `❌ รหัสผ่านไม่ถูกต้อง!\n\nเลข 4 หลักท้ายของบัตรประชาชนไม่ตรงกับข้อมูลในระบบ HOSxP\nกรุณาตรวจสอบและกดลองใหม่อีกครั้งค่ะ`,
              },
              createPdpaPinPromptFlex(binding.patientName, binding.hn),
            ]);
          }
          continue;
        }

        // Vitals & Lab Results Trigger (Prompt for PIN)
        if (
          text === 'ผลตรวจสุขภาพ' ||
          text.includes('ผลแล็บ') ||
          text.includes('สัญญาณชีพ') ||
          text.includes('ความดัน') ||
          text.includes('BMI')
        ) {
          const binding = await getLineUserBinding(lineUserId);
          const pdpaPromptFlex = createPdpaPinPromptFlex(
            binding?.patientName || 'ผู้ป่วย',
            binding?.hn || 'HN-XXXXX'
          );
          await sendLineReplyMessage(replyToken, [pdpaPromptFlex]);
          continue;
        }

        // General Wellness & Prevention Flex Card Trigger
        if (text === 'ข้อมูลสุขภาพดี' || text.includes('สุขภาพดี')) {
          const flex = createGeneralWellnessFlexMessage();
          await sendLineReplyMessage(replyToken, [flex]);
          continue;
        }

        // Tile 6: "คำแนะนำสุขภาพ"
        if (text === 'คำแนะนำสุขภาพ' || text.includes('ความรู้') || text.includes('คำแนะนำ')) {
          const flex = createHealthEducationMenuFlex();
          await sendLineReplyMessage(replyToken, [flex]);
          continue;
        }

        // --------------------------------------------------------
        // Registration Flow & Account Binding
        // --------------------------------------------------------
        if (
          text === 'ลงทะเบียนผู้ป่วย' ||
          text.includes('ผู้ป่วย') ||
          text.includes('ญาติ')
        ) {
          const promptFlex = createPatientRegistrationPromptFlex();
          await sendLineReplyMessage(replyToken, [promptFlex]);
          continue;
        }

        if (
          text === 'ลงทะเบียนเจ้าหน้าที่' ||
          text.includes('เจ้าหน้าที่')
        ) {
          const promptFlex = createStaffRegistrationPromptFlex();
          await sendLineReplyMessage(replyToken, [promptFlex]);
          continue;
        }

        // Birth Year Verification Input (e.g. Y2495 or 4-digit BE year 2400-2600 when pending)
        const cleanDigitsOnly = text.replace(/[^0-9]/g, '');
        const isYearInput =
          text.toUpperCase().startsWith('Y') ||
          (cleanDigitsOnly.length === 4 &&
            parseInt(cleanDigitsOnly, 10) >= 2400 &&
            parseInt(cleanDigitsOnly, 10) <= 2600);

        if ((isYearInput || pendingVerificationStore.has(lineUserId)) && cleanDigitsOnly.length === 4) {
          const pending = pendingVerificationStore.get(lineUserId);
          const targetHn = pending?.hn || '';

          if (targetHn) {
            const verifyRes = await verifyPatientBirthYear(targetHn, cleanDigitsOnly);

            if (verifyRes.valid) {
              // Verified! Check 3-account limit
              if (verifyRes.activeCount >= 3) {
                const maxFlex = createMaxBindingReachedFlex(verifyRes.patientName, verifyRes.hn, verifyRes.activeCount);
                await sendLineReplyMessage(replyToken, [maxFlex]);
                pendingVerificationStore.delete(lineUserId);
                continue;
              }

              const userRole = pending?.userRole || 'patient';
              await bindLineUserToHn(lineUserId, verifyRes.hn, verifyRes.patientName, {
                userRole,
                overrideExisting: userRole === 'patient',
              });
              pendingVerificationStore.delete(lineUserId);

              const patientMatch = await findPatientByHnOrCidInHosxp(verifyRes.hn);
              const rawCid = patientMatch.cid || targetHn;
              const maskedCid =
                rawCid.length === 13
                  ? `${rawCid.substring(0, 1)}-${rawCid.substring(1, 5)}-XXXXX-${rawCid.substring(10, 12)}-${rawCid.substring(12)}`
                  : rawCid;

              const roleNotice = userRole === 'caregiver' ? '👥 ลงทะเบียนในฐานะ: ญาติ / ผู้ดูแล' : '👤 ลงทะเบียนในฐานะ: ผู้ป่วยหลัก';
              const infoFlex = createPatientInfoVerificationFlex(
                patientMatch.patientName,
                patientMatch.hn,
                maskedCid,
                patientMatch.clinics,
                (patientMatch as any).vitals
              );

              const isEnrolledInClinic = patientMatch.clinics && patientMatch.clinics.length > 0;
              const replyMessages: any[] = [
                {
                  type: 'text',
                  text: `✅ ${roleNotice}\nยืนยันปี พ.ศ. เกิดถูกต้อง! ผูกบัญชี LINE เรียบร้อยแล้วค่ะ`,
                },
                infoFlex,
              ];

              if (isEnrolledInClinic) {
                replyMessages.push(createRiskAssessmentAndMenuFlex());
              }

              await sendLineReplyMessage(replyToken, replyMessages);
              continue;
            } else {
              const retryFlex = createBirthYearVerificationPromptFlex(
                verifyRes.patientName || pending?.patientName || 'ผู้ป่วย',
                targetHn,
                pending?.userRole || 'patient'
              );
              await sendLineReplyMessage(replyToken, [
                {
                  type: 'text',
                  text: `❌ ปี พ.ศ. เกิดไม่ถูกต้อง!\n\nปีเกิด "${cleanDigitsOnly}" ไม่ตรงกับข้อมูลในระบบ HOSxP รพ.คลองหาด\nกรุณาตรวจสอบปีเกิด 4 หลัก จากบัตรประชาชนของผู้ป่วยและลองใหม่อีกครั้งค่ะ`,
                },
                retryFlex,
              ]);
              continue;
            }
          }
        }

        // Interactive Role Selection Handling: REGISTER_SELF:HN-XXXXX / REGISTER_CAREGIVER:HN-XXXXX
        if (text.startsWith('REGISTER_SELF:') || text.startsWith('REGISTER_CAREGIVER:')) {
          const isCaregiver = text.startsWith('REGISTER_CAREGIVER:');
          const targetHn = text.replace(/^REGISTER_(SELF|CAREGIVER):/i, '');
          const patientMatch = await findPatientByHnOrCidInHosxp(targetHn);

          if (patientMatch.found) {
            const activeCount = await getActiveBindingCountForHn(patientMatch.hn);

            if (activeCount >= 3) {
              const maxFlex = createMaxBindingReachedFlex(patientMatch.patientName, patientMatch.hn, activeCount);
              await sendLineReplyMessage(replyToken, [maxFlex]);
              continue;
            }

            // Save pending verification and prompt for 4-digit Birth Year
            pendingVerificationStore.set(lineUserId, {
              hn: patientMatch.hn,
              patientName: patientMatch.patientName,
              userRole: isCaregiver ? 'caregiver' : 'patient',
            });

            const promptFlex = createBirthYearVerificationPromptFlex(
              patientMatch.patientName,
              patientMatch.hn,
              isCaregiver ? 'caregiver' : 'patient'
            );
            await sendLineReplyMessage(replyToken, [promptFlex]);
          }
          continue;
        }

        // Patient Registration matching HN format (HN-XXXXX), 13-digit CID, or digits (3-13 digits)
        const cleanDigitsStr = text.replace(/[^0-9]/g, '');
        if (
          text.toUpperCase().startsWith('HN-') ||
          cleanDigitsStr.length === 13 ||
          (cleanDigitsStr.length >= 3 && cleanDigitsStr.length <= 10)
        ) {
          const patientMatch = await findPatientByHnOrCidInHosxp(text);

          if (patientMatch.found) {
            const activeCount = await getActiveBindingCountForHn(patientMatch.hn);

            if (activeCount >= 3) {
              const maxFlex = createMaxBindingReachedFlex(patientMatch.patientName, patientMatch.hn, activeCount);
              await sendLineReplyMessage(replyToken, [maxFlex]);
              continue;
            }

            // Save pending verification and prompt for 4-digit Birth Year
            pendingVerificationStore.set(lineUserId, {
              hn: patientMatch.hn,
              patientName: patientMatch.patientName,
              userRole: 'patient',
            });

            const promptFlex = createBirthYearVerificationPromptFlex(
              patientMatch.patientName,
              patientMatch.hn,
              'patient'
            );
            await sendLineReplyMessage(replyToken, [promptFlex]);
          } else {
            await sendLineReplyMessage(replyToken, [
              {
                type: 'text',
                text: `⚠️ ไม่พบข้อมูลหมายเลข "${text}" ในระบบผู้ป่วยโรงพยาบาลคลองหาด กรุณาตรวจสอบเลขบัตรประชาชน หรือ HN อีกครั้งค่ะ`,
              },
            ]);
          }
          continue;
        }

        // Staff Registration matching STAFF-, NURSE-, DOC- or HOSxP loginname
        if (
          text.toUpperCase().startsWith('STAFF-') ||
          text.toUpperCase().startsWith('NURSE-') ||
          text.toUpperCase().startsWith('DOC-')
        ) {
          const staffMatch = await findStaffInHosxp(text);
          const successFlex = createRegistrationSuccessFlex(
            'staff',
            staffMatch.staffName,
            staffMatch.staffCode,
            lineUserId
          );
          await sendLineReplyMessage(replyToken, [
            {
              type: 'text',
              text: `⚡ ผูกสิทธิ์เจ้าหน้าที่สำเร็จ!\nยินดีต้อนรับ ${staffMatch.staffName} (${staffMatch.department || 'คลินิก NCDs'})`,
            },
            successFlex,
          ]);
          continue;
        }

        // Default fallback to Role Selection / Welcome Card
        const menuFlex = createRoleSelectionFlexMessage();
        const res = await sendLineReplyMessage(replyToken, [menuFlex]);
        console.log('📤 Reply message result:', res);
      }
    }

    // All replies have been sent by now — safe to wait for the queued
    // Supabase log writes before the serverless invocation ends.
    await Promise.allSettled(pendingLogWrites);

    return NextResponse.json({ status: 'ok', processed: events.length });
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'KHH Safe-Connect LINE Webhook',
    timestamp: new Date().toISOString(),
  });
}
