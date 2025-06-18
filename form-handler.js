// Import de la configuration
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

// Import de Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Initialisation du client Supabase
console.log('Initialisation du client Supabase avec:', { 
    SUPABASE_URL, 
    SUPABASE_KEY: SUPABASE_KEY.substring(0, 10) + '...',
    keyLength: SUPABASE_KEY.length
});

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Vérification de l'authentification
async function checkAuth() {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        console.log('État de l\'authentification:', { 
            hasSession: !!session,
            error: error ? error.message : null,
            sessionDetails: session ? {
                user: session.user ? {
                    id: session.user.id,
                    email: session.user.email,
                    role: session.user.role
                } : null,
                access_token: session.access_token ? 'present' : 'missing'
            } : null
        });
        return !error;
    } catch (err) {
        console.error('Erreur lors de la vérification de l\'authentification:', err);
        return false;
    }
}

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

// Fonction pour afficher un message de succès
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-green);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 1000;
        animation: slideIn 0.5s ease-out;
    `;
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    // Supprimer le message après 5 secondes
    setTimeout(() => {
        successDiv.style.animation = 'slideOut 0.5s ease-out';
        setTimeout(() => successDiv.remove(), 500);
    }, 5000);
}

// Ajout des styles d'animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Gestionnaire de soumission du formulaire
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    hideError();
    
    const submitBtn = this.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Envoi en cours...';
    submitBtn.disabled = true;

    try {
        console.log('Début de la soumission du formulaire');
        
        // Vérifier l'authentification avant de continuer
        const isAuthenticated = await checkAuth();
        console.log('Résultat de la vérification d\'authentification:', isAuthenticated);
        
        if (!isAuthenticated) {
            throw new Error('Erreur d\'authentification avec Supabase');
        }
        
        const formData = new FormData(this);
        const name = formData.get('name').trim();
        const email = formData.get('email').trim();
        const message = formData.get('message').trim();
        const file = formData.get('file');

        console.log('Données du formulaire récupérées:', { 
            name, 
            email, 
            messageLength: message.length,
            hasFile: !!file
        });

        // Validation basique
        if (name.length < 2) {
            throw new Error('Le nom doit contenir au moins 2 caractères');
        }

        if (!email.includes('@')) {
            throw new Error('Veuillez entrer une adresse email valide');
        }

        if (!message) {
            throw new Error('Veuillez entrer un message');
        }

        let fileUrl = null;

        // Si un fichier est fourni, l'uploader
        if (file && file.size > 0) {
            console.log('Tentative d\'upload du fichier:', file.name);
            
            if (file.size > 50 * 1024 * 1024) {
                throw new Error('Le fichier est trop volumineux (max 50MB)');
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            
            // Upload du fichier
            const { data: fileData, error: uploadError } = await supabaseClient.storage
                .from('fichiers_devis')
                .upload(fileName, file);

            if (uploadError) {
                console.error('Erreur lors de l\'upload du fichier:', uploadError);
                throw uploadError;
            }

            console.log('Fichier uploadé avec succès:', fileName);

            // Récupération de l'URL publique
            const { data: { publicUrl } } = supabaseClient.storage
                .from('fichiers_devis')
                .getPublicUrl(fileName);

            fileUrl = publicUrl;
            console.log('URL publique du fichier:', fileUrl);
        }

        // Envoi des données du formulaire
        console.log('Tentative d\'insertion dans la base de données');
        const { data, error: insertError } = await supabaseClient
            .from('demandes_devis')
            .insert([
                {
                    nom: name,
                    email: email,
                    message: message,
                    fichier_url: fileUrl,
                    date_soumission: new Date().toISOString()
                }
            ])
            .select();

        if (insertError) {
            console.error('Erreur détaillée lors de l\'insertion:', {
                message: insertError.message,
                details: insertError.details,
                hint: insertError.hint,
                code: insertError.code
            });
            throw insertError;
        }

        console.log('Données insérées avec succès:', data);

        // Réinitialisation du formulaire et message de succès
        this.reset();
        showSuccess('✅ Merci pour votre demande ! Nous vous répondrons dans les plus brefs délais.');
        
    } catch (error) {
        console.error('Erreur complète:', error);
        showError(error.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}); 