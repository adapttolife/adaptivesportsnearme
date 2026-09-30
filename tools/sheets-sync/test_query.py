"""Offline cost/equivalence regression. All fixture rows are synthetic."""
import pathlib,re,sqlite3,unittest
ROOT=pathlib.Path(__file__).parent
OLD='SELECT d.*, (SELECT count(*) FROM organization_data_sources ods WHERE ods.source_id=d.source_id) AS orgs_linked FROM data_sources d ORDER BY d.source_name COLLATE NOCASE'
class Tests(unittest.TestCase):
 def test_same_counts_without_nested_scans(self):
  db=sqlite3.connect(':memory:');db.row_factory=sqlite3.Row
  db.execute('CREATE TABLE data_sources(source_id TEXT PRIMARY KEY,source_name TEXT)')
  db.execute('CREATE TABLE organization_data_sources(organization_id TEXT,source_id TEXT,PRIMARY KEY(organization_id,source_id))')
  db.executemany('INSERT INTO data_sources VALUES (?,?)',[(str(i),'Fixture '+str(i)) for i in range(100)])
  db.executemany('INSERT INTO organization_data_sources VALUES (?,?)',[(str(i),str(i%99)) for i in range(4000)])
  def run(sql):
   steps=[0]
   def tick():steps[0]+=1;return 0
   db.set_progress_handler(tick,1);rows=[dict(r) for r in db.execute(sql)];db.set_progress_handler(None,0);return rows,steps[0]
  expected,old_steps=run(OLD)
  for name in ['index.js','staging-engine.js']:
   text=(ROOT/name).read_text();matches=re.findall(r'`(SELECT d\.\*, COALESCE.*?ORDER BY d\.source_name COLLATE NOCASE)`',text,re.S)
   self.assertEqual(len(matches),1);self.assertIn('rows_read: rowsRead',text)
   got,steps=run(matches[0]);self.assertEqual(got,expected);self.assertLess(steps,old_steps/8)
   self.assertEqual(next(r['orgs_linked'] for r in got if r['source_id']=='99'),0)
if __name__=='__main__':unittest.main()
