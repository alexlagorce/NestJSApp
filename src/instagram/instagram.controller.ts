import { Controller, Get, Post, Query } from '@nestjs/common';
import { InstagramService } from './instagram.service';

@Controller('instagram')
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}

  @Get('test')
    getTest() {
        return 'Test Instagram';
    }

    @Get('login')
    getInstagramLoginUrl() {
        console.log('Génération de l\'URL de connexion Instagram');
        const redirectUri = 'https://nestjsapp.onrender.com/instagram/test-callback';
        console.log('Redirect URI utilisé pour le login:', redirectUri);
        const encodedRedirectUri = encodeURIComponent(redirectUri);
        const loginUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=8810392132361238&redirect_uri=${redirectUri}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish`;
        console.log('URL générée pour Instagram login:', loginUrl);
        return { loginUrl };
        
    }
    
    @Get('test-callback')
    async handleInstagramCallback(@Query('code') code: string) {
        // Supprimer les éventuels fragments
        code = code?.split('#')[0];
        console.log('Code nettoyé:', code);

        console.log('Code reçu depuis Instagram:', code); // Vérifiez si le code est bien reçu
        if (!code) {
            throw new Error('Code d\'autorisation manquant');
        }
    
        try {
            console.log('Appel à la méthode exchangeCodeForToken');
            const tokenData = await this.instagramService.exchangeCodeForToken(code);
            console.log('Token reçu:', tokenData); // Vérifiez si le token est bien reçu
            return tokenData; // Retournez les données du token pour confirmer que tout fonctionne
        } catch (error) {
            console.error('Erreur dans handleInstagramCallback:', error.message);
            throw new Error('Erreur dans le callback Instagram.');
        }
    }

  @Get('user-profile')
    async getUserProfile(@Query('userId') userId: string, @Query('accessToken') accessToken: string) {
    return this.instagramService.getUserProfile(userId, accessToken);
    }

}

