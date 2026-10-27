import json
from django.test import TestCase

class MazeAPITestCase(TestCase):
    def test_create_maze_endpoint(self):
        payload = {
            "rows": 10,
            "columns": 10,
            "algorithm": "Kruskal"
        }
        response = self.client.post(
            "/api/mazes",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertIn("grid", response_data)

