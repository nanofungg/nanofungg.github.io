import http from 'node:http';
import {readFile} from 'node:fs/promises';
const root = new URL('./dist/', import.meta.url);
http.createServer(async (req,res)=>{try {const pathname=new URL(req.url,'http://localhost').pathname; if(pathname!=='/' && pathname!=='/index.html'){res.writeHead(404);res.end('Not found');return;} res.setHeader('Content-Type','text/html; charset=utf-8');res.end(await readFile(new URL('index.html',root)));}catch{res.writeHead(500);res.end('Preview unavailable');}}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
