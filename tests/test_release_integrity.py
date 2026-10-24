import json
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class ReleaseIntegrity(unittest.TestCase):
    def test_manifest(self):
        m=json.loads((ROOT/'assets/release-manifest.json').read_text())
        self.assertEqual(m['release'],'11.1')
        self.assertEqual(m['production_entry'],'index.html')
        self.assertFalse(m['public_versioned_entrypoints'])
        self.assertTrue((ROOT/m['bootstrap']).exists())
        for path in m['modules_in_order']:
            self.assertTrue((ROOT/path).is_file(),path)
    def test_single_entrypoint(self):
        idx=(ROOT/'index.html').read_text()
        self.assertIn('bootstrap-v11.js',idx)
        self.assertFalse(any(ROOT.glob('v[0-9]*.html')))
    def test_render_hooks_and_scope(self):
        boot=(ROOT/'assets/bootstrap-v11.js').read_text()
        self.assertIn("v9V10Patch=v9Patch.replace",boot)
        self.assertIn("v104Patch+'\\n'+v11Patch+'\\n'+v111Patch+'\\n})();'",boot)
        self.assertIn('v101Patched',boot)
        self.assertIn('v11Patch',boot)
        self.assertIn('v111Patch',boot)
        self.assertIn('renderingHooks',boot)
        self.assertIn('v9-active-2d',boot)
        self.assertIn("missing.join('; ')",boot)
        self.assertTrue((ROOT/'assets/replay-core.html').exists())
    def test_feature_metadata(self):
        source=(ROOT/'v10-4-subsystem-explorer.patch.js').read_text()
        for fragment in ('v104TrailLength','v104Follow','v104Distance','v104Period','v10LoadMoons','native-p6f-part'):
            self.assertIn(fragment,source)
        self.assertTrue((ROOT/'data/jpl-p6f-primary.json').is_file())
        self.assertTrue((ROOT/'replays/catalog.json').is_file())
        self.assertTrue((ROOT/'v10-3-stability.patch.js').is_file())
        pilot=(ROOT/'v11-pilot-training.patch.js').read_text()
        for keyword in ('computePreview','v11Difficulty','v11Report','v11NextLesson','v11ForecastEnabled'):
            self.assertIn(keyword,pilot)
if __name__=='__main__':unittest.main()

class Recorded3dGallery(unittest.TestCase):
    def test_gallery_samples_and_qualifications(self):
        idx=json.loads((ROOT/'data/3d-maneuvers/INDEX.json').read_text())
        self.assertEqual(idx['schema'],'gad-3d-maneuver-gallery-index-v1')
        self.assertEqual(len(idx['items']),4)
        for record in idx['items']:
            path=ROOT/'data/3d-maneuvers'/record['file']
            self.assertTrue(path.is_file(),path)
            d=json.loads(path.read_text())
            self.assertEqual(d['scenario_id'],record['id'])
            self.assertEqual(d['source_sha256'],record['source_sha256'])
            self.assertEqual(len(d['samples']),record['preview_samples'])
            self.assertEqual(d['body_count'],31)
            self.assertTrue(all(b[0]>=a[0] for a,b in zip(d['samples'],d['samples'][1:])))
            self.assertEqual(d['qualification'],record['qualification'])
            self.assertTrue(d['qualification_details']['continuous_guard'])
            self.assertTrue(d['qualification_details']['rk45'])
            self.assertTrue(d['qualification_details']['gad_off'])
            self.assertEqual(len(d['commands']),3)
        patch=(ROOT/'v11-1-recorded-3d-maneuvers.patch.js').read_text()
        for key in ('c3lRecorded','c3lReference','sampleAt','commandAt','c3lMission','c3lQualification'):
            self.assertIn(key,patch)
