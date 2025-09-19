import { Request, Response, NextFunction } from 'express';

interface LogData {
  method: string;
  url: string;
  ip: string;
  userAgent?: string | undefined;
  timestamp: string;
  responseTime?: number | undefined;
  statusCode?: number | undefined;
  contentLength?: string | undefined;
}

export const logger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  const logData: LogData = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  };

  // Override res.end to capture response data
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, cb?: (() => void) | undefined) {
    const responseTime = Date.now() - startTime;
    
    logData.responseTime = responseTime;
    logData.statusCode = res.statusCode;
    const contentLength = res.get('Content-Length');
    logData.contentLength = contentLength || undefined;

    // Log the request based on status code
    if (res.statusCode >= 500) {
      console.error('[ERROR]', formatLog(logData));
    } else if (res.statusCode >= 400) {
      console.warn('[WARN]', formatLog(logData));
    } else {
      console.log('[INFO]', formatLog(logData));
    }

    // Call original end function
    return originalEnd.call(this, chunk, encoding, cb);
  };

  next();
};

const formatLog = (data: LogData): string => {
  const { method, url, ip, responseTime, statusCode, contentLength } = data;
  
  let logMessage = `${method} ${url} - ${ip}`;
  
  if (statusCode) {
    logMessage += ` - ${statusCode}`;
  }
  
  if (responseTime) {
    logMessage += ` - ${responseTime}ms`;
  }
  
  if (contentLength) {
    logMessage += ` - ${contentLength} bytes`;
  }
  
  return logMessage;
};

// Enhanced logger for development
export const devLogger = (req: Request, _res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log('\n[DEBUG] Request Details:');
    console.log(`   Method: ${req.method}`);
    console.log(`   URL: ${req.originalUrl}`);
    console.log(`   IP: ${req.ip}`);
    console.log(`   User-Agent: ${req.get('User-Agent')}`);
    
    if (Object.keys(req.query).length > 0) {
      console.log(`   Query: ${JSON.stringify(req.query, null, 2)}`);
    }
    
    if (Object.keys(req.body).length > 0 && req.method !== 'GET') {
      // Don't log sensitive data
      const sanitizedBody = { ...req.body };
      if (sanitizedBody.password) sanitizedBody.password = '[HIDDEN]';
      if (sanitizedBody.confirmPassword) sanitizedBody.confirmPassword = '[HIDDEN]';
      console.log(`   Body: ${JSON.stringify(sanitizedBody, null, 2)}`);
    }
  }
  
  next();
};