import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { DataSource } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

describe('TransactionsService - Transfer Logic', () => {
    let service: TransactionsService;
    
    // 1. Khởi tạo QueryRunner giả
    const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
    };

    const mockManager = {
        findOne: jest.fn(),
        save: jest.fn(),
        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: mockManager,
    };

    // 2. Khởi tạo DataSource giả
    const mockDataSource = {
        createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
        manager: mockManager,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TransactionsService,
                { provide: DataSource, useValue: mockDataSource },
            ],
        }).compile();

        service = module.get<TransactionsService>(TransactionsService);
    });

    afterEach(() => {
        jest.clearAllMocks(); // Xóa lịch sử mock sau mỗi test case
    });

    describe('transfer() - Validation & Hạn mức', () => {
        const userId = 'user-1';
        
        // Helper function để tạo DTO nhanh
        const createDto = (amount: number) => ({
            fromAccountNumber: '1111',
            toAccountNumber: '2222',
            amount,
            description: 'Chuyển tiền',
            idempotencyKey: 'key-' + Math.random() // Unique key
        });

        // LƯU Ý: Vì fromAccountNumber = '1111' < toAccountNumber = '2222' 
        // Nên logic chống Deadlock trong code sẽ gọi findOne(fromAccount) TRƯỚC findOne(toAccount)

        it('1. Phải ném lỗi BadRequestException nếu số dư không đủ (Số dư = 0)', async () => {
            mockManager.findOne
                .mockResolvedValueOnce(null) // Lần 1: Check IdempotencyKey -> null
                .mockResolvedValueOnce({ id: 'from-id', balance: 0 }) // Lần 2: Tìm fromAccount
                .mockResolvedValueOnce({ id: 'to-id', balance: 0 }); // Lần 3: Tìm toAccount

            await expect(
                service.transfer(userId, 'customer', createDto(1000))
            ).rejects.toThrow('Số dư tài khoản không đủ');
        });

        it('2. Phải ném lỗi BadRequestException nếu số dư âm', async () => {
            mockManager.findOne
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({ id: 'from-id', balance: -50000 }) // fromAccount 
                .mockResolvedValueOnce({ id: 'to-id', balance: 0 }); // toAccount

            await expect(
                service.transfer(userId, 'customer', createDto(10000))
            ).rejects.toThrow('Số dư tài khoản không đủ');
        });

        it('3. Phải ném lỗi BadRequestException nếu vượt hạn mức ngày (200 triệu)', async () => {
            mockManager.findOne
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({ id: 'from-id', balance: 500000000 }) // fromAccount dư sức
                .mockResolvedValueOnce({ id: 'to-id', balance: 0 }); 

            // Giả lập tổng giao dịch trong ngày đã là 190 triệu
            mockQueryBuilder.getRawOne.mockResolvedValueOnce({ totalSent: 190000000 });

            // Thử chuyển thêm 15 triệu (190 + 15 = 205 triệu > hạn mức 200)
            await expect(
                service.transfer(userId, 'customer', createDto(15000000))
            ).rejects.toThrow(/Giao dịch vượt quá hạn mức/);
        });

        it('4. Phải vượt qua validation nếu chuyển đúng bằng chạm trần hạn mức (200 triệu)', async () => {
            mockManager.findOne
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({ id: 'from-id', balance: 500000000 }) 
                .mockResolvedValueOnce({ id: 'to-id', balance: 0 }); 

            // Giả lập hôm nay chưa giao dịch gì (0 đồng)
            mockQueryBuilder.getRawOne.mockResolvedValueOnce({ totalSent: 0 });
            
            // Giả lập hàm save lưu thành công
            mockManager.save.mockResolvedValue({ id: 'tx-id' });

            // Thử chuyển đúng 200 triệu
            const result = await service.transfer(userId, 'teller', createDto(200000000));
            
            expect(result).toBeDefined();
            expect(mockQueryRunner.commitTransaction).toHaveBeenCalled(); // Giao dịch phải được commit
        });
        
        it('5. Phải ném lỗi nếu chuyển vượt hạn mức đúng 1 đồng (200 triệu + 1đ)', async () => {
            mockManager.findOne
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({ id: 'from-id', balance: 500000000 }) 
                .mockResolvedValueOnce({ id: 'to-id', balance: 0 }); 

            mockQueryBuilder.getRawOne.mockResolvedValueOnce({ totalSent: 0 });

            // Thử chuyển 200.000.001 VNĐ
            await expect(
                service.transfer(userId, 'customer', createDto(200000001))
            ).rejects.toThrow(/Giao dịch vượt quá hạn mức/);
        });
    });
});