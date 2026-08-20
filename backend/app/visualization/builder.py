"""
Apache ECharts Visualization Specification Generator for MetricMind.
Section 9: Returns structured chart metadata for dynamic frontend rendering.
"""

from typing import List, Dict, Any, Optional

class EChartsBuilder:

    @staticmethod
    def build_bar_chart(
        title: str,
        data: List[Dict[str, Any]],
        category_dim: str,
        value_cols: List[str]
    ) -> Dict[str, Any]:
        categories = [str(item.get(category_dim, "")) for item in data]
        series = []

        colors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"]

        for idx, col in enumerate(value_cols):
            values = [item.get(col, 0) for item in data]
            series.append({
                "name": col.replace("_", " ").title(),
                "type": "bar",
                "data": values,
                "itemStyle": {"color": colors[idx % len(colors)]}
            })

        return {
            "title": {
                "text": title,
                "textStyle": {"color": "#F3F4F6", "fontSize": 16, "fontWeight": 600}
            },
            "tooltip": {
                "trigger": "axis",
                "axisPointer": {"type": "shadow"}
            },
            "legend": {
                "data": [s["name"] for s in series],
                "textStyle": {"color": "#9CA3AF"},
                "bottom": 0
            },
            "grid": {"left": "3%", "right": "4%", "bottom": "15%", "containLabel": True},
            "xAxis": {
                "type": "category",
                "data": categories,
                "axisLabel": {"color": "#9CA3AF"},
                "axisLine": {"lineStyle": {"color": "#4B5563"}}
            },
            "yAxis": {
                "type": "value",
                "axisLabel": {"color": "#9CA3AF"},
                "splitLine": {"lineStyle": {"color": "#374151"}}
            },
            "series": series
        }

    @staticmethod
    def build_line_chart(
        title: str,
        data: List[Dict[str, Any]],
        category_dim: str,
        value_cols: List[str]
    ) -> Dict[str, Any]:
        categories = [str(item.get(category_dim, "")) for item in data]
        series = []

        colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

        for idx, col in enumerate(value_cols):
            values = [item.get(col, 0) for item in data]
            series.append({
                "name": col.replace("_", " ").title(),
                "type": "line",
                "smooth": True,
                "data": values,
                "lineStyle": {"width": 3},
                "itemStyle": {"color": colors[idx % len(colors)]}
            })

        return {
            "title": {
                "text": title,
                "textStyle": {"color": "#F3F4F6", "fontSize": 16, "fontWeight": 600}
            },
            "tooltip": {"trigger": "axis"},
            "legend": {
                "data": [s["name"] for s in series],
                "textStyle": {"color": "#9CA3AF"},
                "bottom": 0
            },
            "grid": {"left": "3%", "right": "4%", "bottom": "15%", "containLabel": True},
            "xAxis": {
                "type": "category",
                "data": categories,
                "axisLabel": {"color": "#9CA3AF"},
                "axisLine": {"lineStyle": {"color": "#4B5563"}}
            },
            "yAxis": {
                "type": "value",
                "axisLabel": {"color": "#9CA3AF"},
                "splitLine": {"lineStyle": {"color": "#374151"}}
            },
            "series": series
        }
