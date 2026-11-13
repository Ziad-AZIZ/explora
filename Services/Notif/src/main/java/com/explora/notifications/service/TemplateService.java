package com.explora.notifications.service;

import com.explora.notifications.entity.NotificationTemplate;
import com.explora.notifications.enums.NotificationType;
import com.explora.notifications.repository.NotificationTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class TemplateService {

    @Autowired
    private NotificationTemplateRepository templateRepo;

    /**
     * Construit le titre + body finaux à partir d'un template + variables.
     * Si la langue demandée n'existe pas, fallback sur "fr".
     *
     * @return un tableau [title, body], ou null si aucun template trouvé
     */
    public String[] buildMessage(NotificationType type, String language, Map<String, String> variables) {
        // 1. Chercher le template dans la langue demandée
        Optional<NotificationTemplate> template = templateRepo.findByTypeAndLanguage(type, language);

        // 2. Fallback sur "fr" si pas trouvé
        if (template.isEmpty()) {
            System.out.println("⚠️ Template " + type + " en " + language + " non trouvé, fallback sur fr");
            template = templateRepo.findByTypeAndLanguage(type, "fr");
        }

        // 3. Si toujours rien, on abandonne
        if (template.isEmpty()) {
            System.err.println("❌ Aucun template pour " + type);
            return null;
        }

        // 4. Remplacer les {{variables}} dans le titre et le body
        String title = replaceVariables(template.get().getTitleTemplate(), variables);
        String body = replaceVariables(template.get().getBodyTemplate(), variables);

        return new String[]{title, body};
    }

    /**
     * Remplace toutes les occurrences de {{key}} par leur valeur.
     */
    private String replaceVariables(String text, Map<String, String> variables) {
        if (variables == null) return text;

        String result = text;
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            result = result.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        return result;
    }
}