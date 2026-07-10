import { EventSubscriber, EntitySubscriberInterface, UpdateEvent } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserHistory } from '../entities/user-history.entity';

@EventSubscriber()
export class UserHistorySubscriber implements EntitySubscriberInterface<User> {
    listenTo() {
        return User;
    }

    async afterUpdate(event: UpdateEvent<User>) {
        if (!event.entity || !event.databaseEntity) return;

        // Check if sensitive info (email or phoneNumber) has changed
        const oldEmail = event.databaseEntity.email;
        const newEmail = event.entity.email;
        const oldPhone = event.databaseEntity.phoneNumber;
        const newPhone = event.entity.phoneNumber;

        if (oldEmail !== newEmail || oldPhone !== newPhone) {
            // If changed, save the old state to UserHistory
            const history = new UserHistory();
            history.user = event.databaseEntity as User;
            history.oldEmail = oldEmail;
            history.oldPhoneNumber = oldPhone;
            history.oldFullName = event.databaseEntity.fullName;

            await event.manager.save(UserHistory, history);
        }
    }
}
