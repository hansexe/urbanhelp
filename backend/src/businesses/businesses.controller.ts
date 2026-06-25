import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { RolesGuard } from '@common/guards/roles.guard';

@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async registerBusiness(@Body() dto: any) {
    return this.businessesService.registerBusiness(dto);
  }

  @Get(':id')
  async getBusinessProfile(@Param('id') businessId: string) {
    return this.businessesService.getBusinessProfile(businessId);
  }

  @Put(':id/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  async updateBusinessProfile(@Param('id') businessId: string, @Request() req: any, @Body() updates: any) {
    if (req.user.userId !== businessId) {
      throw new Error('Unauthorized');
    }
    return this.businessesService.updateBusinessProfile(businessId, updates);
  }

  @Put(':id/banking')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  async updateBankingDetails(
    @Param('id') businessId: string,
    @Request() req: any,
    @Body() dto: any,
  ) {
    if (req.user.userId !== businessId) {
      throw new Error('Unauthorized');
    }
    return this.businessesService.updateBankingDetails(
      businessId,
      dto.accountName,
      dto.bsb,
      dto.accountNumber,
    );
  }
}
