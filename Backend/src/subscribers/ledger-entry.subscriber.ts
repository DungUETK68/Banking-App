import { EventSubscriber, EntitySubscriberInterface, UpdateEvent, RemoveEvent } from 'typeorm';
import { LedgerEntry } from '../entities/ledger-entry.entity';

@EventSubscriber()
export class LedgerEntrySubscriber implements EntitySubscriberInterface<LedgerEntry> {
    listenTo() {
        return LedgerEntry;
    }

    beforeUpdate(event: UpdateEvent<LedgerEntry>) {
        throw new Error('CẢNH BÁO: Bút toán sổ cái không được phép sửa đổi!');
    }

    beforeRemove(event: RemoveEvent<LedgerEntry>) {
        throw new Error('CẢNH BÁO: Bút toán sổ cái không được phép xóa!');
    }
}