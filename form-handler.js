// Initialisation du client Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Fonction pour afficher les erreurs
function showError(message) {
    const errorDiv = document.getElementById('formError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideError() {
    const errorDiv = document.getElementById('formError');
    errorDiv.style.display = 'none';
}

// Gestionnaire de soumission du formulaire
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    hideError();
    
    const submitBtn = this.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Envoi en cours...';
    submitBtn.disabled = true;

    try {
        const formData = new FormData(this);
        const name = formData.get('name').trim();
        const email = formData.get('email').trim();
        const message = formData.get('message').trim();
        const file = formData.get('file');

        // Validation basique
        if (name.length < 2) {
            throw new Error('Le nom doit contenir au moins 2 caractères');
        }

        if (!email.includes('@')) {
            throw new Error('Veuillez entrer une adresse email valide');
        }

        if (message.length < 10) {
            throw new Error('Le message doit contenir au moins 10 caractères');
        }

        let fileUrl = null;

        // Si un fichier est fourni, l'uploader
        if (file && file.size > 0) {
            if (file.size > 50 * 1024 * 1024) { // 50MB en bytes
                throw new Error('Le fichier est trop volumineux (max 50MB)');
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            
            // Upload du fichier
            const { data: fileData, error: uploadError } = await supabase.storage
                .from('fichiers_devis')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Récupération de l'URL publique
            const { data: { publicUrl } } = supabase.storage
                .from('fichiers_devis')
                .getPublicUrl(fileName);

            fileUrl = publicUrl;
        }

        // Envoi des données du formulaire
        const { error: insertError } = await supabase
            .from('demandes_devis')
            .insert([
                {
                    nom: name,
                    email: email,
                    message: message,
                    fichier_url: fileUrl,
                    date_soumission: new Date().toISOString()
                }
            ]);

        if (insertError) throw insertError;

        // Réinitialisation du formulaire et message de succès
        this.reset();
        alert('✅ Merci pour votre demande ! Nous vous répondrons dans les plus brefs délais.');
        
    } catch (error) {
        console.error('Erreur:', error);
        showError(error.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}); 