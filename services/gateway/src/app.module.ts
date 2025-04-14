import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserManagementModule } from './user_management/user_management.module';
import { ProductsModule } from './products/products.module';
import { CompaniesModule } from './companies/companies.module';
import { PoliciesModule } from './policies/policies.module';
import { ClaimsModule } from './claims/claims.module';
import { PaymentsModule } from './payments/payments.module';
import { CommissionsModule } from './commissions/commissions.module';
import { RiskModule } from './risk/risk.module';
import { NdviModule } from './ndvi/ndvi.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AuthModule, UserManagementModule, ProductsModule, CompaniesModule, PoliciesModule, ClaimsModule, PaymentsModule, CommissionsModule, RiskModule, NdviModule, DashboardModule, ReportsModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
