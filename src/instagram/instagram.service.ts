import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { REDIRECT_URI } from 'src/instagram/constant';
import { InstagramMediaResponse, ContainerStatusResponse } from './instagram.types';

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

  // Fonction pour vérifier l'état du conteneur
  private async checkContainerStatus(containerId: string, accessToken: string): Promise<boolean> {
    const statusUrl = `https://graph.instagram.com/v21.0/${containerId}`;
    const params = { fields: 'status_code', access_token: accessToken };

    for (let i = 0; i < 5; i++) { // Réessayer jusqu'à 5 fois
      const response = await axios.get<ContainerStatusResponse>(statusUrl, { params });
      const { status_code } = response.data;

      console.log(`Vérification du statut : Tentative ${i + 1} - Statut : ${status_code}`);
      if (status_code === 'FINISHED') {
        return true; // Le conteneur est prêt
      }

      await this.sleep(5000); // Attendre 5 secondes avant de réessayer
    }

    return false; // Le conteneur n'est pas prêt après 5 tentatives
  }

  // Fonction pour attendre un délai donné
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Ajout de la fonction pour publier un Reel
  async postInstagramReel(
    igUserId: string,
    accessToken: string,
    videoUrl: string,
    caption: string
  ): Promise<InstagramMediaResponse> {
    try {
      console.log('Étape 1: Création du conteneur pour le Reel...');
      const createContainerUrl = `https://graph.instagram.com/v21.0/${igUserId}/media`;
  
      const containerResponse = await axios.post<InstagramMediaResponse>(
        createContainerUrl,
        null,
        {
          params: {
            media_type: 'REELS',
            video_url: videoUrl,
            caption: caption,
            access_token: accessToken,
          },
        }
      );
  
      const { id: creationId } = containerResponse.data; // TypeScript connaît maintenant le type
      console.log('Conteneur créé avec succès, ID:', creationId);

      // Étape 2 : Vérifier que le conteneur est prêt
      console.log('Étape 2: Vérification du statut du conteneur...');
      const isReady = await this.checkContainerStatus(creationId, accessToken);

      if (!isReady) {
        throw new Error("Le conteneur n'est pas prêt après plusieurs tentatives.");
      }

      // Étape 3 : Publier le conteneur
      console.log('Étape 3: Publication du conteneur...');
      const publishUrl = `https://graph.instagram.com/v21.0/${igUserId}/media_publish`;

      const publishResponse = await axios.post<InstagramMediaResponse>(
        publishUrl,
        null,
        {
          params: {
            creation_id: creationId,
            access_token: accessToken,
          },
        }
      );
  
      console.log('Reel publié avec succès:', publishResponse.data);
      return publishResponse.data;
    } catch (error) {
      console.error(
        'Erreur lors de la publication du Reel :',
        error.response?.data || error.message
      );
      throw new Error('Impossible de publier le Reel.');
    }
  }

}
