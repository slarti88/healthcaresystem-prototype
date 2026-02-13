import cron from 'node-cron';
import PatientLink from '../models/PatientLink';
import Vitals from '../models/Vitals';
import DoctorComment from '../models/DoctorComment';
import { sendMail } from '../services/emailService';

function formatVitals(vitals: any): string {
  return [
    `  Heart Rate:      ${vitals.heartRate} bpm`,
    `  Blood Pressure:  ${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} mmHg`,
    `  Temperature:     ${vitals.temperature} °F`,
    `  Oxygen Level:    ${vitals.oxygenLevel}%`,
    `  Weight:          ${vitals.weight} lbs`,
    `  Recorded At:     ${new Date(vitals.recordedAt).toLocaleString()}`,
  ].join('\n');
}

function buildEmailBody(
  patientName: string,
  vitals: any,
  comment: any
): string {
  const lines: string[] = [];

  lines.push(`Patient Status Update for ${patientName}`);
  lines.push('='.repeat(45));
  lines.push('');
  lines.push('Latest Vitals:');
  lines.push(formatVitals(vitals));
  lines.push('');

  if (comment) {
    const doctorName = comment.staffId?.name || 'Unknown';
    lines.push(`Latest Doctor Comment (by ${doctorName}):`);
    lines.push(`  "${comment.comment}"`);
  } else {
    lines.push('Latest Doctor Comment: No comments yet.');
  }

  lines.push('');
  lines.push('---');
  lines.push('This is an automated message from the Healthcare System.');

  return lines.join('\n');
}

async function sendPatientStatusEmails(): Promise<void> {
  console.log(`[Cron] Patient status email job started at ${new Date().toISOString()}`);

  try {
    const patientLinks = await PatientLink.find()
      .populate('patientId', 'name email')
      .populate('links.linkedUserId', 'name email');

    if (patientLinks.length === 0) {
      console.log('[Cron] No patient links found. Skipping.');
      return;
    }

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const doc of patientLinks) {
      const patient = doc.patientId as any;
      if (!patient || !patient.name) {
        console.log(`[Cron] Skipping doc ${doc._id}: patient not found.`);
        continue;
      }

      const familyMembers = doc.links.filter(
        (link) => link.relationship === 'family'
      );

      if (familyMembers.length === 0) continue;

      const latestVitals = await Vitals.findOne({ patientId: patient._id })
        .sort({ recordedAt: -1 })
        .lean();

      if (!latestVitals) {
        console.log(`[Cron] Skipping ${patient.name}: no vitals recorded.`);
        continue;
      }

      const latestComment = await DoctorComment.findOne({ patientId: patient._id })
        .populate('staffId', 'name')
        .sort({ createdAt: -1 })
        .lean();

      const subject = `Hourly Status Update: ${patient.name}`;
      const body = buildEmailBody(patient.name, latestVitals, latestComment);

      for (const familyLink of familyMembers) {
        const familyUser = familyLink.linkedUserId as any;
        if (!familyUser || !familyUser.email) {
          console.log('[Cron] Skipping link: family user not found or has no email.');
          continue;
        }

        try {
          await sendMail({ to: familyUser.email, subject, text: body });
          emailsSent++;
        } catch (err) {
          emailsFailed++;
          console.error(
            `[Cron] Failed to send email to ${familyUser.email}:`,
            err instanceof Error ? err.message : err
          );
        }
      }
    }

    console.log(`[Cron] Job completed. Emails sent: ${emailsSent}, failed: ${emailsFailed}.`);
  } catch (err) {
    console.error('[Cron] Fatal error in patient status email job:', err);
  }
}

export function startPatientStatusCron(): void {
  cron.schedule('0 * * * *', () => {
    sendPatientStatusEmails().catch((err) => {
      console.error('[Cron] Unhandled error in cron callback:', err);
    });
  });

  console.log('[Cron] Patient status email job scheduled (every hour at :00).');
}
