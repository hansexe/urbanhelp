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
  ValidationPipe,
  ForbiddenException,
} from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ParseUUIDPipe } from '@nestjs/common';
import { BusinessRegistrationDto } from '../../dtos/business/business-registration.dto';
import {
  UpdateBusinessProfileDto,
  UpdateBankingDetailsDto,
} from '../../dtos/business/business-update.dto';

/**
 * BusinessesController
 * Handles all business-related endpoints:
 * - Registration with full validation
 * - Profile management
 * - Banking details updates
 * - Business profile retrieval
 *
 * Security:
 * - All endpoints use comprehensive DTOs with ValidationPipe
 * - Update endpoints require JWT authentication and business role
 * - Ownership checks prevent unauthorized modifications
 */

@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  /**
   * Register a new business
   * POST /businesses/register
   *
   * @param dto - BusinessRegistrationDto with all required business information
   * @returns Registration status with business ID and approval status
   * @throws BadRequestException - Invalid input or duplicate registration
   * @throws ConflictException - Business/email already registered
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async registerBusiness(
    @Body(ValidationPipe) dto: BusinessRegistrationDto,
  ) {
    return this.businessesService.registerBusiness(dto);
  }

  /**
   * Get business profile by ID
   * GET /businesses/:id
   * Public endpoint - returns publicly available business information
   *
   * @param id - Business ID (UUID)
   * @returns Business profile with services, hours, images, and banking status
   * @throws NotFoundException - Business not found
   */
  @Get(':id')
  async getBusiness(@Param('id', ParseUUIDPipe) id: string) {
    return this.businessesService.getBusinessProfile(id);
  }

  /**
   * Update business profile
   * PUT /businesses/:id/profile
   * Requires: JWT authentication + business role + ownership verification
   *
   * @param businessId - Business ID (UUID)
   * @param req - Express request with user object from JWT
   * @param updates - UpdateBusinessProfileDto with optional profile fields
   * @returns Confirmation message
   * @throws ForbiddenException - User does not own this business
   * @throws NotFoundException - Business not found
   */
  @Put(':id/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  async updateBusinessProfile(
    @Param('id', ParseUUIDPipe) businessId: string,
    @Request() req: any,
    @Body(ValidationPipe) updates: UpdateBusinessProfileDto,
  ) {
    // Ownership check: JWT userId must match businessId
    if (req.user.userId !== businessId) {
      throw new ForbiddenException(
        'You do not have permission to update this business profile',
      );
    }

    return this.businessesService.updateBusinessProfile(businessId, updates);
  }

  /**
   * Update banking details
   * PUT /businesses/:id/banking
   * Requires: JWT authentication + business role + ownership verification
   *
   * @param businessId - Business ID (UUID)
   * @param req - Express request with user object from JWT
   * @param dto - UpdateBankingDetailsDto with account details
   * @returns Confirmation message
   * @throws ForbiddenException - User does not own this business
   * @throws BadRequestException - Invalid banking details
   * @throws NotFoundException - Business not found
   */
  @Put(':id/banking')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  async updateBankingDetails(
    @Param('id', ParseUUIDPipe) businessId: string,
    @Request() req: any,
    @Body(ValidationPipe) dto: UpdateBankingDetailsDto,
  ) {
    // Ownership check: JWT userId must match businessId
    if (req.user.userId !== businessId) {
      throw new ForbiddenException(
        'You do not have permission to update this business banking details',
      );
    }

    return this.businessesService.updateBankingDetails(businessId, dto);
  }
}
