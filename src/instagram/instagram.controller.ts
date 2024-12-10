import { Controller, Get, Query } from '@nestjs/common';
import { InstagramService } from './instagram.service';

@Controller('instagram')
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}

  @Get('login')
  getInstagramLoginUrl() {
    const clientId = '1369551120699970';
    const redirectUri = 'https://nestjsapp.onrender.com/instagram/callback';
    const scope = 'instagram_basic,instagram_content_publish,pages_show_list';
    const responseType = 'code';

    const loginUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=${responseType}`;
    return { loginUrl };
  }

  @Get('callback')
    async handleInstagramCallback(@Query('code') code: string) {
    if (!code) {
        throw new Error('Code d\'autorisation manquant');
    }
    return this.instagramService.exchangeCodeForToken(code);
    }

  @Get('user-profile')
    async getUserProfile(@Query('userId') userId: string, @Query('accessToken') accessToken: string) {
    return this.instagramService.getUserProfile(userId, accessToken);
    }

}