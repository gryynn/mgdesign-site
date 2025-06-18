// Initialisation du client Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Gestionnaire de soumission du formulaire
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Envoi en cours...';
    submitBtn.disabled = true;

    try {
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        const file = formData.get('file');

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
        alert('❌ Une erreur est survenue. Veuillez réessayer ou nous contacter directement.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}); 