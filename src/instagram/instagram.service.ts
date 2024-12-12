import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InstagramService {
    private readonly apiUrl: string;
    private readonly accessToken: string;
    private readonly clientId: string;
    private readonly clientSecret: string;

    constructor(private configService: ConfigService) {
        this.apiUrl = this.configService.get<string>('INSTAGRAM_API_URL');
        this.accessToken = this.configService.get<string>('INSTAGRAM_ACCESS_TOKEN');
        this.clientId = this.configService.get<string>('INSTAGRAM_CLIENT_ID');
        this.clientSecret = this.configService.get<string>('INSTAGRAM_CLIENT_SECRET');
      }
        
      async exchangeCodeForToken(code: string) {
        try {
            console.log('Début de la méthode exchangeCodeForToken');
            console.log('Code reçu:', code);
    
            const redirectUri = 'https://nestjsapp.onrender.com/instagram/test-callback/';
            if (!redirectUri || !code) {
              throw new Error('Redirect URI ou code manquant.');
          }
          console.log('Redirect URI utilisé:', redirectUri);
    
            const requestData = new URLSearchParams({
              client_id: this.clientId,
              client_secret: this.clientSecret,
              grant_type: 'authorization_code',
              redirect_uri: redirectUri,
              code,
          });

          console.log('FormData préparé :', requestData.toString());
          
          const response = await fetch('https://api.instagram.com/oauth/access_token', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: requestData.toString(),
          });
    
            console.log('Réponse HTTP de l\'API Instagram:');
            console.log('Status:', response.status);
            console.log('StatusText:', response.statusText);
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Erreur retournée par Instagram:', errorData);
                throw new Error('Failed to exchange code for token.');
            }
    
            const data = await response.json();
            console.log('Réponse JSON de l\'API Instagram:', data);
    
            return data;
        } catch (error) {
            console.error('Erreur dans exchangeCodeForToken:', error.message);
            throw new Error('Erreur lors de l\'échange de code pour le token.');
        }
    }

    async getUserProfile(userId: string, accessToken: string) {
        try {
          const response = await axios.get(`${this.apiUrl}/${userId}`, {
            params: {
              fields: 'id,username,account_type',
              access_token: accessToken,
            },
          });
          return response.data;
        } catch (error) {
          console.error('Error fetching Instagram user profile:', error.response?.data || error.message);
          throw new Error('Failed to fetch user profile.');
        }
      }

}