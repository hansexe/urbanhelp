// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RawBodyRequest } from '@nestjs/common';
import { AppModule } from './app.module';
import { appConfig } from './config/database.config';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  const config = appConfig();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // CORS
  app.enableCors(config.cors);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global error handling middleware would be added here

  await app.listen(config.port);
  console.log(`Urban Help API running on port ${config.port}`);
}

bootstrap();

// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { BusinessesModule } from './businesses/businesses.module';
import { SearchModule } from './search/search.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AdminModule } from './admin/admin.module';
import { UploadsModule } from './uploads/uploads.module';
import { databaseConfig } from './config/database.config';
import { UserEntity } from './common/entities/user.entity';
import { CustomerEntity } from './common/entities/customer.entity';
import { BusinessEntity } from './common/entities/business.entity';
import { BusinessServiceEntity } from './common/entities/business-service.entity';
import { BusinessHoursEntity } from './common/entities/business-hours.entity';
import { BusinessImageEntity } from './common/entities/business-image.entity';
import { BookingEntity } from './common/entities/booking.entity';
import { PaymentEntity } from './common/entities/payment.entity';
import { ReviewEntity } from './common/entities/review.entity';
import { NotificationEntity } from './common/entities/notification.entity';
import { OtpCodeEntity } from './common/entities/otp-code.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      ...databaseConfig(),
      entities: [
        UserEntity,
        CustomerEntity,
        BusinessEntity,
        BusinessServiceEntity,
        BusinessHoursEntity,
        BusinessImageEntity,
        BookingEntity,
        PaymentEntity,
        ReviewEntity,
        NotificationEntity,
        OtpCodeEntity,
      ],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.DATABASE_LOGGING === 'true',
    }),
    AuthModule,
    CustomersModule,
    BusinessesModule,
    SearchModule,
    BookingsModule,
    PaymentsModule,
    ReviewsModule,
    AdminModule,
    UploadsModule,
  ],
})
export class AppModule {}

// backend/src/customers/customers.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../common/entities/customer.entity';
import { UserEntity } from '../common/entities/user.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(CustomerEntity)
    private customersRepository: Repository<CustomerEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const customer = await this.customersRepository.findOne({
      where: { id: userId },
    });

    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      mobile: user.mobile,
      address: customer.address,
      suburb: customer.suburb,
      postcode: customer.postcode,
      state: customer.state,
      phoneVerified: customer.phone_verified,
      emailVerified: customer.email_verified,
    };
  }

  async updateProfile(userId: string, updateDto: any) {
    const { firstName, lastName, address, suburb, postcode, state } = updateDto;

    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (firstName) user.first_name = firstName;
    if (lastName) user.last_name = lastName;

    await this.usersRepository.save(user);

    const customer = await this.customersRepository.findOne({
      where: { id: userId },
    });

    if (address) customer.address = address;
    if (suburb) customer.suburb = suburb;
    if (postcode) customer.postcode = postcode;
    if (state) customer.state = state;

    await this.customersRepository.save(customer);

    return { message: 'Profile updated successfully' };
  }

  async changeEmail(userId: string, newEmail: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.email = newEmail;
    user.is_verified = false;
    await this.usersRepository.save(user);

    return { message: 'Email change initiated. Verification code sent.' };
  }

  async changePhone(userId: string, newPhone: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.mobile = newPhone;
    await this.usersRepository.save(user);

    const customer = await this.customersRepository.findOne({
      where: { id: userId },
    });

    customer.phone_verified = false;
    await this.customersRepository.save(customer);

    return { message: 'Phone change initiated. Verification code sent.' };
  }
}

// backend/src/customers/customers.controller.ts
import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return this.customersService.getProfile(req.user.userId);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() updateDto: any) {
    return this.customersService.updateProfile(req.user.userId, updateDto);
  }

  @Put('email')
  @UseGuards(JwtAuthGuard)
  async changeEmail(@Request() req, @Body() changeEmailDto: { newEmail: string }) {
    return this.customersService.changeEmail(req.user.userId, changeEmailDto.newEmail);
  }

  @Put('phone')
  @UseGuards(JwtAuthGuard)
  async changePhone(@Request() req, @Body() changePhoneDto: { newPhone: string }) {
    return this.customersService.changePhone(req.user.userId, changePhoneDto.newPhone);
  }
}

// backend/src/customers/customers.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerEntity } from '../common/entities/customer.entity';
import { UserEntity } from '../common/entities/user.entity';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity, UserEntity])],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}

// backend/src/search/search.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessEntity } from '../common/entities/business.entity';
import { BusinessServiceEntity } from '../common/entities/business-service.entity';
import { ReviewEntity } from '../common/entities/review.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(BusinessEntity)
    private businessesRepository: Repository<BusinessEntity>,
    @InjectRepository(BusinessServiceEntity)
    private businessServicesRepository: Repository<BusinessServiceEntity>,
    @InjectRepository(ReviewEntity)
    private reviewsRepository: Repository<ReviewEntity>,
  ) {}

  async searchBusinesses(filters: any) {
    const { serviceType, suburb, postcode, latitude, longitude, radius = 25, page = 1, limit = 20, sortBy = 'distance' } = filters;

    let query = this.businessesRepository.createQueryBuilder('b')
      .where('b.is_approved = :isApproved', { isApproved: true })
      .andWhere('b.is_suspended = :isSuspended', { isSuspended: false });

    // Filter by service type
    if (serviceType) {
      query = query
        .innerJoin(
          BusinessServiceEntity,
          'bs',
          'b.id = bs.business_id AND bs.service_type = :serviceType',
          { serviceType },
        );
    }

    // Filter by suburb or postcode
    if (suburb) {
      query = query.andWhere('b.suburb ILIKE :suburb', { suburb: `%${suburb}%` });
    }

    if (postcode) {
      query = query.andWhere('b.postcode = :postcode', { postcode });
    }

    // Sorting
    if (sortBy === 'rating') {
      query = query.orderBy('b.avg_rating', 'DESC');
    } else if (sortBy === 'reviews') {
      query = query.orderBy('b.total_reviews', 'DESC');
    } else {
      query = query.orderBy('b.created_at', 'DESC');
    }

    const [businesses, total] = await query
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

    const result = businesses.map(business => ({
      id: business.id,
      name: business.name,
      suburb: business.suburb,
      postcode: business.postcode,
      state: business.state,
      avgRating: business.avg_rating,
      totalReviews: business.total_reviews,
      isVerified: business.is_verified,
      distance: Math.random() * 10, // Calculate real distance if lat/long provided
    }));

    return {
      businesses: result,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    };
  }

  async getBusinessProfile(businessId: string) {
    const business = await this.businessesRepository.findOne({
      where: { id: businessId },
    });

    if (!business || !business.is_approved) {
      throw new BadRequestException('Business not found');
    }

    const services = await this.businessServicesRepository.find({
      where: { business_id: businessId },
    });

    const reviews = await this.reviewsRepository.find({
      where: { business_id: businessId },
      order: { created_at: 'DESC' },
      take: 10,
    });

    return {
      id: business.id,
      name: business.name,
      description: business.description,
      experience: business.experience,
      qualifications: business.qualifications,
      licences: business.licences,
      suburb: business.suburb,
      postcode: business.postcode,
      state: business.state,
      serviceRadius: business.service_radius,
      avgRating: business.avg_rating,
      totalReviews: business.total_reviews,
      isVerified: business.is_verified,
      services: services.map(s => ({
        serviceType: s.service_type,
        businessHoursFee: s.business_hours_fee,
        outOfHoursFee: s.out_of_hours_fee,
      })),
      reviews: reviews.map(r => ({
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at,
      })),
    };
  }
}

// backend/src/search/search.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('businesses')
  async searchBusinesses(
    @Query('serviceType') serviceType?: string,
    @Query('suburb') suburb?: string,
    @Query('postcode') postcode?: string,
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
    @Query('radius') radius?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.searchService.searchBusinesses({
      serviceType,
      suburb,
      postcode,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      radius: radius ? parseInt(radius) : 25,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      sortBy: sortBy || 'distance',
    });
  }

  @Get('businesses/:id')
  async getBusinessProfile(@Query('id') businessId: string) {
    return this.searchService.getBusinessProfile(businessId);
  }
}

// backend/src/search/search.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessEntity } from '../common/entities/business.entity';
import { BusinessServiceEntity } from '../common/entities/business-service.entity';
import { ReviewEntity } from '../common/entities/review.entity';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessEntity, BusinessServiceEntity, ReviewEntity])],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}

// Placeholder modules (to be implemented similarly)

// backend/src/bookings/bookings.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from '../common/entities/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BookingEntity])],
})
export class BookingsModule {}

// backend/src/reviews/reviews.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from '../common/entities/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewEntity])],
})
export class ReviewsModule {}

// backend/src/businesses/businesses.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessEntity } from '../common/entities/business.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessEntity])],
})
export class BusinessesModule {}

// backend/src/admin/admin.module.ts
import { Module } from '@nestjs/common';

@Module({})
export class AdminModule {}

// backend/src/uploads/uploads.module.ts
import { Module } from '@nestjs/common';

@Module({})
export class UploadsModule {}
