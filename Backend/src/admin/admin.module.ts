import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ReconciliationReport } from './entities/reconciliation-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReconciliationReport])],
  providers: [AdminService],
  controllers: [AdminController]
})
export class AdminModule {}
