import { EventSubscriber, EntitySubscriberInterface, UpdateEvent, SoftRemoveEvent } from 'typeorm';
import { User } from '../entities/user.entity';
import { AuditLog } from '../../admin/entities/audit-log.entity';
import { RequestContext } from '../../utils/request-context';

@EventSubscriber()
export class AuditLogSubscriber implements EntitySubscriberInterface<User> {
    listenTo() {
        return User;
    }

    async afterSoftRemove(event: SoftRemoveEvent<User>) {
        if (!event.entity) return;

        const req = RequestContext.getStore();
        const actorId = req?.user?.id || 'HỆ_THỐNG';
        const ipAddress = req?.ip || '';
        const userAgent = req?.headers?.['user-agent'] || '';

        const auditLog = new AuditLog();
        auditLog.actorId = actorId;
        auditLog.action = 'DELETE_USER';
        auditLog.entityName = 'User';
        auditLog.entityId = event.entity.id as string;
        auditLog.ipAddress = ipAddress;
        auditLog.userAgent = userAgent;

        auditLog.beforeData = { status: event.databaseEntity?.status || event.entity.status };
        auditLog.afterData = { deleted: true };
        await event.manager.save(AuditLog, auditLog);
    }

    async afterUpdate(event: UpdateEvent<User>) {
        if (!event.entity || !event.databaseEntity) return;
        const oldStatus = event.databaseEntity.status;
        const newStatus = event.entity.status;
        const oldEmail = event.databaseEntity.email;
        const newEmail = event.entity.email;
        const oldPhone = event.databaseEntity.phoneNumber;
        const newPhone = event.entity.phoneNumber;
        const oldFullName = event.databaseEntity.fullName;
        const newFullName = event.entity.fullName;

        let action = '';
        let beforeData: any = {};
        let afterData: any = {};

        if (oldStatus !== newStatus) {
            action = 'UPDATE_USER_STATUS';
            beforeData = { status: oldStatus };
            afterData = { status: newStatus };
        } else if (oldEmail !== newEmail || oldPhone !== newPhone || oldFullName !== newFullName) {
            action = 'UPDATE_PROFILE';
            if (oldEmail !== newEmail) {
                beforeData.email = oldEmail;
                afterData.email = newEmail;
            }
            if (oldPhone !== newPhone) {
                beforeData.phoneNumber = oldPhone;
                afterData.phoneNumber = newPhone;
            }
            if (oldFullName !== newFullName) {
                beforeData.fullName = oldFullName;
                afterData.fullName = newFullName;
            }
        }

        if (!action) return;

        const req = RequestContext.getStore();
        const actorId = req?.user?.id || 'HỆ_THỐNG';
        const ipAddress = req?.ip || '';
        const userAgent = req?.headers?.['user-agent'] || '';

        const auditLog = new AuditLog();
        auditLog.actorId = actorId;
        auditLog.action = action;
        auditLog.entityName = 'User';
        auditLog.entityId = event.entity.id as string;
        auditLog.ipAddress = ipAddress;
        auditLog.userAgent = userAgent;

        auditLog.beforeData = beforeData;
        auditLog.afterData = afterData;
        await event.manager.save(AuditLog, auditLog);
    }
}