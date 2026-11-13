package com.explora.notifications.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.UnsupportedEncodingException;
import java.util.Map;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Value("${explora.email.from}")
    private String fromEmail;

    @Value("${explora.email.from-name}")
    private String fromName;

    /**
     * Envoie un email HTML basé sur un template Thymeleaf.
     *
     * @param to           Destinataire
     * @param subject      Sujet
     * @param templateName Nom du template (sans .html), ex: "welcome-email"
     * @param variables    Variables à injecter dans le template
     * @return true si envoyé, false sinon
     */
    public boolean sendHtmlEmail(String to, String subject, String templateName, Map<String, Object> variables) {
        try {
            // 1. Construire le contenu HTML à partir du template + variables
            Context context = new Context();
            context.setVariables(variables);
            String htmlContent = templateEngine.process(templateName, context);

            // 2. Construire l'email MIME (HTML)
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML

            // 3. Envoyer
            mailSender.send(message);
            System.out.println("✅ Email envoyé à : " + to + " (template: " + templateName + ")");
            return true;

        } catch (MessagingException | UnsupportedEncodingException e) {
            System.err.println("❌ Erreur envoi email : " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Email de bienvenue après inscription.
     */
    public boolean sendWelcomeEmail(String to, String userName) {
        return sendHtmlEmail(
                to,
                "Bienvenue sur Explora Maroc 🇲🇦",
                "welcome-email",
                Map.of("userName", userName)
        );
    }

    /**
     * Email de réinitialisation de mot de passe.
     */
    public boolean sendPasswordResetEmail(String to, String userName, String resetLink) {
        return sendHtmlEmail(
                to,
                "Réinitialisation de ton mot de passe Explora",
                "password-reset-email",
                Map.of(
                        "userName", userName,
                        "resetLink", resetLink
                )
        );
    }

    /**
     * Email de confirmation de réservation.
     */
    public boolean sendBookingConfirmationEmail(String to, String userName, String hotelName,
                                                String checkInDate, String checkOutDate,
                                                String bookingId) {
        return sendHtmlEmail(
                to,
                "✅ Confirmation de ta réservation - " + hotelName,
                "booking-confirmation-email",
                Map.of(
                        "userName", userName,
                        "hotelName", hotelName,
                        "checkInDate", checkInDate,
                        "checkOutDate", checkOutDate,
                        "bookingId", bookingId
                )
        );
    }
}