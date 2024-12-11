import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import qs from 'qs'; // Utilisez qs pour convertir l'objet en chaîne de requête

@Injectable()
export class InstagramService {
    private readonly apiUrl: string;
    private readonly accessToken: string;

    constructor(private configService: ConfigService) {
        this.apiUrl = this.configService.get<string>('INSTAGRAM_API_URL');
        this.accessToken = this.configService.get<string>('INSTAGRAM_ACCESS_TOKEN');
      }

      async exchangeCodeForToken(code: string) {
        try {
            const redirectUri = 'https://nestjsapp.onrender.com/instagram/callback';
            const encodedRedirectUri = encodeURIComponent(redirectUri);
            console.log('URI redirection encodée:', encodedRedirectUri);
            
            const requestData = new URLSearchParams({
                client_id: '8810392132361238',
                client_secret: '6f3355913a763664e69',
                grant_type: 'authorization_code',
                redirect_uri: encodedRedirectUri,
                code,
            }).toString();
    
            console.log('Données formatées pour le POST :', requestData);
    
            const response = await axios.post(
                'https://api.instagram.com/oauth/access_token',
                requestData,
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );
    
            return response.data;
        } catch (error) {
            console.error('Error exchanging code for token:', error.response?.data || error.message);
            throw new Error('Failed to exchange code for token.');
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