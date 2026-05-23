import * as fs from 'fs';
import * as path from 'path';
import { universities } from './data/universities';

const list = universities.map(u => `${u.id}: ${u.name}`).join('\n');
console.log(list);
