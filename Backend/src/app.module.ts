import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/entities/user.entity';
import { Account } from './accounts/entities/account.entity';
import { Transaction } from './transactions/entities/transaction.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AccountsModule } from './accounts/accounts.module';
import { AccountsService } from './accounts/accounts.service';
import { AdminModule } from './admin/admin.module';
import { TransactionsModule } from './transactions/transactions.module';
import { LedgerEntry } from './transactions/entities/ledger-entry.entity';
import { LedgerEntrySubscriber } from './transactions/subscribers/ledger-entry.subscriber';
import { AuditLog } from './admin/entities/audit-log.entity';
import { AuditLogSubscriber } from './users/subscribers/audit-log.subscriber';
import { UserHistory } from './users/entities/user-history.entity';
import { UserHistorySubscriber } from './users/subscribers/user-history.subscriber';
import { Session } from './auth/entities/session.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
        entities: [User, Account, Transaction, LedgerEntry, AuditLog, UserHistory, Session],
        subscribers: [LedgerEntrySubscriber, AuditLogSubscriber, UserHistorySubscriber],
      }),
    }),

    UsersModule,
    AuthModule,
    AccountsModule,
    AdminModule,
    TransactionsModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, AccountsService],
})
export class AppModule { }
