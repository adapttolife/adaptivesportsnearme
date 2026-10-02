"""Offline SQL-work regression. Synthetic data only; live cost is measured separately."""
import pathlib,sqlite3,unittest
ROOT=pathlib.Path(__file__).parent
class Tests(unittest.TestCase):
 def test_linear_snapshot_work_replaces_correlated_organization_lookups(self):
  db=sqlite3.connect(':memory:')
  db.executescript('CREATE TABLE organizations(id TEXT PRIMARY KEY,name TEXT);CREATE TABLE data_sources(source_id TEXT PRIMARY KEY,source_name TEXT);CREATE TABLE organization_data_sources(organization_id TEXT,source_id TEXT,PRIMARY KEY(organization_id,source_id));')
  db.executemany('INSERT INTO organizations VALUES (?,?)',[(str(i),'Organization '+str(i)) for i in range(4000)])
  db.executemany('INSERT INTO data_sources VALUES (?,?)',[(str(i),'Source '+str(i)) for i in range(100)])
  db.executemany('INSERT INTO organization_data_sources VALUES (?,?)',[(str(i),str(i%100)) for i in range(4000)])
  def steps(sql):
   n=[0]
   def tick():n[0]+=1;return 0
   db.set_progress_handler(tick,1);list(db.execute(sql));db.set_progress_handler(None,0);return n[0]
  old=steps("SELECT o.*, (SELECT group_concat(s.source_name, '; ') FROM organization_data_sources ods JOIN data_sources s ON s.source_id=ods.source_id WHERE ods.organization_id=o.id) AS sources FROM organizations o ORDER BY o.name COLLATE NOCASE")
  new=sum(steps(s) for s in ['SELECT * FROM organizations','SELECT organization_id,source_id FROM organization_data_sources ORDER BY organization_id,source_id','SELECT * FROM data_sources ORDER BY source_name COLLATE NOCASE'])
  self.assertLess(new,old/2)
  for name in ['production','staging']:
   text=(ROOT/'assets'/(name+'-engine.mjs')).read_text();block=text[text.index('async function sheetExportLane'):];block=block[:block.index('const sportsByKey')]
   self.assertIn('readOrganizations(db, env)',block);self.assertIn('assembleDirectory(',block);self.assertNotIn('JOIN organizations',block);self.assertNotIn('group_concat',block)
if __name__=='__main__':unittest.main()
