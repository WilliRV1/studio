'use server';

// import { Resend } from 'resend';
// import { RegistrationConfirmationEmail } from '@/emails/RegistrationConfirmationEmail';
// import { PaymentApprovedEmail } from '@/emails/PaymentApprovedEmail';
// import { PaymentRejectedEmail } from '@/emails/PaymentRejectedEmail';
import type { Competition, Category } from '@/lib/types';

// const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'WodMatch <noreply@studiodev.workers.dev>';

type SendEmailPayload = {
    to: string;
    subject: string;
    react: React.ReactElement;
}

async function sendEmail(payload: SendEmailPayload) {
    try {
        console.log(`Email sent to ${payload.to} with subject "${payload.subject}"`);
        return { data: { id: 'mock_email_id' } };
        // const { data, error } = await resend.emails.send({
        //     from: FROM_EMAIL,
        //     ...payload
        // });

        // if (error) {
        //     console.error('Error sending email:', error);
        //     return { error: error.message };
        // }

        // return { data };
    } catch (error) {
        console.error('Exception in sendEmail:', error);
        return { error: 'An unexpected error occurred.' };
    }
}

// --- Specific Email Actions ---

type RegistrationEmailProps = {
    athleteName: string;
    athleteEmail: string;
    competition: Competition;
    category: Category;
    teamName?: string;
};

export async function sendRegistrationConfirmationEmail({
    athleteEmail,
    athleteName,
    competition,
    category,
    teamName,
}: RegistrationEmailProps) {
    console.log('Sending registration confirmation email...');
    return Promise.resolve();
    // return sendEmail({
    //     to: athleteEmail,
    //     subject: `Pre-Inscripción Confirmada: ${competition.name}`,
    //     react: RegistrationConfirmationEmail({
    //         athleteName,
    //         competitionName: competition.name,
    //         categoryName: category.name,
    //         price: category.price,
    //         teamName,
    //         // TODO: Add organizer bank details to competition object
    //         organizerBankDetails: "Bancolombia Ahorros - 123-4567890-12",
    //     }),
    // });
}

type PaymentStatusEmailProps = {
    athleteEmail: string;
    athleteName: string;
    competitionName: string;
    categoryName: string;
    rejectionReason?: string;
};

export async function sendPaymentApprovedEmail({
    athleteEmail,
    athleteName,
    competitionName,
    categoryName,
}: PaymentStatusEmailProps) {
    console.log('Sending payment approved email...');
    return Promise.resolve();
    // return sendEmail({
    //     to: athleteEmail,
    //     subject: `✅ ¡Pago Aprobado! Ya estás dentro de ${competitionName}`,
    //     react: PaymentApprovedEmail({
    //         athleteName,
    //         competitionName,
    //         categoryName,
    //     }),
    // });
}

export async function sendPaymentRejectedEmail({
    athleteEmail,
    athleteName,
    competitionName,
    categoryName,
    rejectionReason,
}: PaymentStatusEmailProps) {
    console.log('Sending payment rejected email...');
    return Promise.resolve();
    // return sendEmail({
    //     to: athleteEmail,
    //     subject: `⚠️ Problema con tu pago para ${competitionName}`,
    //     react: PaymentRejectedEmail({
    //         athleteName,
    //         competitionName,
    //         rejectionReason: rejectionReason || "El organizador no especificó un motivo.",
    //     }),
    // });
}