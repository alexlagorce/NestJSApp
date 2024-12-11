import { Controller, Get, Query } from '@nestjs/common';
import { InstagramService } from './instagram.service';

@Controller('instagram')
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}

  @Get('login')
    getInstagramLoginUrl() {
        const loginUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=8810392132361238&redirect_uri=https://nestjsapp.onrender.com/instagram/callback&response_type=code&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish`;
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