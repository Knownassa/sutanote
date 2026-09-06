import{n as e}from"./rolldown-runtime-hePW80VL.js";import{t}from"./database-DQHpFc6R.js";var n=e({flushBoard:()=>i});function r(e,t){return e.map((e,n)=>`$${t+n+1}`).join(`,`)}async function i(e,n,i,a,o){let s=[...i],c=[...o];await t.transaction(async t=>{s.length>0&&await t.query(`DELETE FROM canvas_nodes WHERE id IN (${r(s,0)})`,s),c.length>0&&await t.query(`DELETE FROM canvas_edges WHERE id IN (${r(c,0)})`,c);for(let r of n.values())i.has(r.id)||await t.query(`INSERT INTO canvas_nodes
           (id, board_id, type, position_x, position_y, width, height, z_index, data, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, NOW())
         ON CONFLICT (id) DO UPDATE SET
           board_id = EXCLUDED.board_id,
           type = EXCLUDED.type,
           position_x = EXCLUDED.position_x,
           position_y = EXCLUDED.position_y,
           width = EXCLUDED.width,
           height = EXCLUDED.height,
           z_index = EXCLUDED.z_index,
           data = EXCLUDED.data,
           updated_at = NOW()`,[r.id,e,r.type??`sticky`,r.position.x,r.position.y,r.style?.width??null,r.style?.minHeight??null,r.zIndex??0,JSON.stringify(r.data)]);for(let n of a.values())o.has(n.id)||await t.query(`INSERT INTO canvas_edges
           (id, board_id, source_id, target_id, source_handle, target_handle, type, data, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8, NOW())
         ON CONFLICT (id) DO UPDATE SET
           board_id = EXCLUDED.board_id,
           source_id = EXCLUDED.source_id,
           target_id = EXCLUDED.target_id,
           source_handle = EXCLUDED.source_handle,
           target_handle = EXCLUDED.target_handle,
           type = EXCLUDED.type,
           data = EXCLUDED.data,
           updated_at = NOW()`,[n.id,e,n.source,n.target,n.sourceHandle??null,n.targetHandle??null,n.type??null,n.data?JSON.stringify(n.data):null])})}export{n,i as t};