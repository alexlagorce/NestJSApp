import { Controller, Get, Query } from '@nestjs/common';
import { InstagramService } from './instagram.service';
import axios from 'axios';

@Controller('instagram')
export class InstagramController {
    private readonly redirectUri = 'https://nestjsapp.onrender.com/instagram/callback';
    private readonly clientId = '8810392132361238';
    private readonly clientSecret = '6f3355913a763664e69';
    constructor(private readonly instagramService: InstagramService) {}

  @Get('test')
    getTest() {
        return 'Test Instagram';
    }

    @Get('login')
    getInstagramLoginUrl() {
        const encodedRedirectUri = encodeURIComponent(this.redirectUri);
        const loginUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=8810392132361238&redirect_uri=${encodedRedirectUri}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish`;
        return { loginUrl };
    }
    
    @Get('callback')
        async handleInstagramCallback(@Query('code') code: string) {
            console.log('Code reçu depuis Instagram:', code); // Vérifiez si le code est bien reçu
            if (!code) {
            throw new Error('Code d\'autorisation manquant');
            }

            try {
            // Préparez les données pour la requête POST
            const encodedRedirectUri = encodeURIComponent(this.redirectUri);
            const requestData = `client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=authorization_code&redirect_uri=${encodedRedirectUri}&code=${code}`;
            console.log('Données formatées pour le POST :', requestData);

            // Envoyez la requête POST pour échanger le code contre un token
            const response = await axios.post(
                'https://api.instagram.com/oauth/access_token',
                requestData,
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );

            console.log('Réponse de la requête POST:', response.data);
            return response.data; // Retournez les données du token
            } catch (error) {
            console.error('Erreur lors de l\'échange de code pour le token:', error.response?.data || error.message);
            throw new Error('Erreur lors de l\'échange de code pour le token.');
            }
    }

    @Get('user-profile')
        async getUserProfile(@Query('userId') userId: string, @Query('accessToken') accessToken: string) {
        return this.instagramService.getUserProfile(userId, accessToken);
    }

}