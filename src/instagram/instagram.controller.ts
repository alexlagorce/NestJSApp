import { Controller, Get, Param, Query } from '@nestjs/common';
import { REDIRECT_URI } from 'src/instagram/constant';
import { InstagramService } from './instagram.service';

@Controller('instagram')
export class InstagramController {
    private readonly CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
    
    constructor(private readonly instagramService: InstagramService) {}

    @Get('test')
    getTest() {
        return 'Test Instagram';
    }

    @Get('login')
    getInstagramLoginUrl() {
        console.log("Génération de l'URL de connexion Instagram");
        console.log('Redirect URI utilisé pour le login:', REDIRECT_URI);
        
        // Créer un objet pour gérer les paramètres d'URL
        const params = new URLSearchParams({
            enable_fb_login: '0',
            force_authentication: '1',
            client_id: this.CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            response_type: 'code',
            scope: [
            'instagram_business_basic',
            'instagram_business_manage_messages',
            'instagram_business_manage_comments',
            'instagram_business_content_publish',
            ].join(','),
        });

        // Générer l'URL complète
        const loginUrl = `https://www.instagram.com/oauth/authorize?${params.toString()}`;

        console.log('URL générée pour Instagram login:', loginUrl);
        return { loginUrl };
    }

    @Get('test-callback')
    async handleInstagramCallback(@Query('code') code: string) {
        console.log('Code reçu depuis Instagram:', code); // Vérifiez si le code est bien reçu
        if (!code) {
        throw new Error("Code d'autorisation manquant");
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

    @Get('exchange-token')
        async getLongLivedAccessToken(@Query('shortLivedToken') shortLivedToken: string) {
        console.log('Short-Lived Token reçu:', shortLivedToken);
        if (!shortLivedToken) {
            throw new Error('Short-Lived Token manquant.');
        }
        return this.instagramService.getLongLivedToken(shortLivedToken);
    }

    @Get('user-details')
        async getUserDetails(@Query('accessToken') accessToken: string) {
        if (!accessToken) {
            throw new Error('Access token manquant.');
        }
        
        return this.instagramService.getInstagramUserDetails(accessToken);
    }

    @Get('media')
        async getUserMedia(
        @Query('igUserId') igUserId: string,
        @Query('accessToken') accessToken: string,
        ) {
        if (!igUserId || !accessToken) {
            throw new Error('L\'ID utilisateur Instagram et le token d\'accès sont requis.');
        }

        return this.instagramService.getUserMedia(igUserId, accessToken);
    }

    @Get('media/:mediaId')
        async getMediaDetails(
        @Param('mediaId') mediaId: string,
        @Query('accessToken') accessToken: string,
        ) {
        if (!mediaId || !accessToken) {
            throw new Error('Media ID et access token sont requis.');
        }

        return this.instagramService.getMediaDetails(mediaId, accessToken);
    }

    @Get('publish-reel')
    async publishReel(
        @Query('igUserId') igUserId: string,
        @Query('accessToken') accessToken: string,
        @Query('videoUrl') videoUrl: string,
        @Query('caption') caption: string,
    ) {
        if (!igUserId || !accessToken || !videoUrl) {
        throw new Error('L\'ID utilisateur Instagram, le token d\'accès et l\'URL de la vidéo sont requis.');
        }

        return this.instagramService.postInstagramReel(igUserId, accessToken, videoUrl, caption || '');
    }
    
}
