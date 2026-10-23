import json
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class ReleaseIntegrity(unittest.TestCase):
    def test_manifest(self):
        m=json.loads((ROOT/'assets/release-manifest.json').read_text())
        self.assertEqual(m['release'],'10.4.1')
        self.assertEqual(m['production_entry'],'index.html')
        self.assertFalse(m['public_versioned_entrypoints'])
        self.assertTrue((ROOT/m['bootstrap']).exists())
        for path in m['modules_in_order']:
            self.assertTrue((ROOT/path).is_file(),path)
    def test_single_entrypoint(self):
        idx=(ROOT/'index.html').read_text()
        self.assertIn('bootstrap-v10-4.js',idx)
        self.assertFalse(any(ROOT.glob('v[0-9]*.html')))
    def test_render_hooks_and_scope(self):
        boot=(ROOT/'assets/bootstrap-v10-4.js').read_text()
        self.assertIn("v9V10Patch=v9Patch.replace",boot)
        self.assertIn("v104Patch+'\\n})();'",boot)
        self.assertIn('v101Patched',boot)
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
if __name__=='__main__':unittest.main()
