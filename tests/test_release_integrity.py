import json
import re
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

class ReleaseIntegrity(unittest.TestCase):
    def test_manifest(self):
        m=json.loads((ROOT/"assets/release-manifest.json").read_text())
        self.assertEqual(m["release"],"10.3")
        self.assertEqual(m["production_entry"],"index.html")
        self.assertFalse(m["public_versioned_entrypoints"])
        self.assertTrue((ROOT/m["bootstrap"]).exists())
        for path in m["modules_in_order"]:
            self.assertTrue((ROOT/path).is_file(),path)

    def test_entrypoint(self):
        index=(ROOT/"index.html").read_text()
        self.assertIn("bootstrap-v10-3.js",index)
        self.assertNotIn("v6-2.html",index)
        self.assertFalse(any(ROOT.glob("v[0-9]*.html")),"Multiple public versioned HTML pages are prohibited")

    def test_module_order_and_scope(self):
        boot=(ROOT/"assets/bootstrap-v10-3.js").read_text()
        self.assertIn("v9V10Patch=v9Patch.replace",boot)
        self.assertIn("v102Patch+'\\n'+v103Patch+'\\n})();'",boot)
        self.assertIn("v9-active-2d",boot)
        self.assertIn("missing.join('; ')",boot)
        self.assertNotIn('v6-2.html',boot)
        self.assertTrue((ROOT/"assets/replay-core.html").is_file())

    def test_features_and_evidence(self):
        patch=(ROOT/"v10-3-stability.patch.js").read_text()
        self.assertIn("pauseAllForHiddenTab",patch)
        self.assertIn("v103-playback-shortcuts",patch)
        self.assertIn("GAD_MISSION_CONTROL_RELEASE",patch)
        self.assertIn("physicalModelChanged:false",patch)
        self.assertTrue((ROOT/"replays/catalog.json").is_file())
        self.assertTrue((ROOT/"data/jpl-p6f-primary.json").is_file())

if __name__ == "__main__":
    unittest.main()
