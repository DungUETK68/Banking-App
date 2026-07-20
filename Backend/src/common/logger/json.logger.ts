import { LoggerService, Injectable, ConsoleLogger } from '@nestjs/common';
import { RequestContext } from '../../utils/request-context';

@Injectable()
export class JsonLogger extends ConsoleLogger implements LoggerService {
  log(message: any, context?: string) {
    this.printLog('INFO', message, context);
  }

  error(message: any, stackOrContext?: string, context?: string) {
    // Nếu NestJS truyền stack, message thường là Error object hoặc chuỗi lỗi
    this.printLog('ERROR', message, context || stackOrContext);
  }

  warn(message: any, context?: string) {
    this.printLog('WARN', message, context);
  }

  debug(message: any, context?: string) {
    this.printLog('DEBUG', message, context);
  }

  verbose(message: any, context?: string) {
    this.printLog('VERBOSE', message, context);
  }

  private printLog(level: string, message: any, context?: string) {
    const store = RequestContext.getStore();
    const requestId = store?.requestId || 'system';

    const logObject = {
      timestamp: new Date().toISOString(),
      level,
      requestId,
      context: context || this.context,
      message,
    };

    console.log(JSON.stringify(logObject));
  }
}
