import 'jest';
import fs from 'fs';
import path from 'path';
import { LineReportService } from './linereport';

const rawdata = fs.readFileSync(path.join(__dirname, 'linereport.txt'), 'utf-8');

test('can process line report service', () => {
  const service = new LineReportService(rawdata);
  service.process();
});
