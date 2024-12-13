import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { REDIRECT_URI } from 'src/instagram/constant';

@Injectable()
export class InstagramService {
  private readonly apiUrl: string;
  private readonly accessToken: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('INSTAGRAM_API_URL');
    this.clientId = this.configService.get<string>('INSTAGRAM_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('INSTAGRAM_CLIENT_SECRET');
  }

  async exchangeCodeForToken(code: string) {
    try {
      console.log('Début de la méthode exchangeCodeForToken');
      console.log('Code reçu:', code);

      if (!code) {
        throw new Error('Redirect URI ou code manquant.');
      }
      console.log('Redirect URI utilisé:', REDIRECT_URI);

      const requestData = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code,
      });

      console.log('FormData préparé :', requestData.toString());

      const response = await fetch(
        'https://api.instagram.com/oauth/access_token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: requestData.toString(),
        },
      );

      console.log("Réponse HTTP de l'API Instagram:");
      console.log('Status:', response.status);
      console.log('StatusText:', response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur retournée par Instagram:', errorData);
        throw new Error('Failed to exchange code for token.');
      }

      const data = await response.json();
      console.log("Réponse JSON de l'API Instagram:", data);

      return data;
    } catch (error) {
      console.error('Erreur dans exchangeCodeForToken:', error.message);
      throw new Error("Erreur lors de l'échange de code pour le token.");
    }
  }


  async getLongLivedToken(shortLivedToken: string): Promise<any> {
    try {
      const requestData = new URLSearchParams({
        grant_type: 'ig_exchange_token',
        client_secret: this.clientSecret,
        access_token: shortLivedToken,
      });
  
      const response = await axios.get(
        `https://graph.instagram.com/access_token`,
        { params: requestData }
      );
  
      console.log('Réponse JSON de l’API Instagram (Long-Lived Token):', response.data);
      return response.data; // Retourne le Long-Lived Token et ses détails
    } catch (error) {
      console.error(
        'Erreur lors de l’échange pour un Long-Lived Token:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to exchange Short-Lived Token for Long-Lived Token.');
    }
  }

  async getInstagramUserDetails(accessToken: string): Promise<any> {
    try {
      // Base URL de l'API Instagram
      const url = `https://graph.instagram.com/v21.0/me`;
      
      // Paramètres requis
      const params = {
        fields: 'user_id,username,account_type,profile_picture_url,followers_count,follows_count,media_count',
        access_token: accessToken,
      };
  
      // Appel GET à l'API Instagram
      const response = await axios.get(url, { params });
      
      console.log('Réponse de l’API Instagram (user details):', response.data);
      return response.data; // Retourne les informations de l'utilisateur
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des informations utilisateur:',
        error.response?.data || error.message,
      );
      throw new Error('Impossible de récupérer les informations utilisateur.');
    }
  }

  async getUserMedia(igUserId: string, accessToken: string): Promise<any> {
    try {
      // Construire l'URL de l'API
      const url = `https://graph.instagram.com/v21.0/${igUserId}/media`;
  
      // Effectuer une requête GET avec Axios
      const response = await axios.get(url, {
        params: {
          access_token: accessToken,
        },
      });
  
      console.log('Médias récupérés depuis Instagram :', response.data);
      return response.data; // Retourne les données des médias
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des médias :',
        error.response?.data || error.message,
      );
      throw new Error('Impossible de récupérer les médias.');
    }
  }

  async getMediaDetails(mediaId: string, accessToken: string): Promise<any> {
    try {
      const url = `https://graph.instagram.com/v21.0/${mediaId}`;
  
      // Paramètres pour la requête
      const params = {
        fields: 'id,media_type,media_url,caption,thumbnail_url,timestamp',
        access_token: accessToken,
      };
  
      const response = await axios.get(url, { params });
      console.log('Détails du média récupérés :', response.data);
  
      return response.data; // Retourne les détails du média
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des détails du média :',
        error.response?.data || error.message,
      );
      throw new Error('Impossible de récupérer les détails du média.');
    }
  }
}
