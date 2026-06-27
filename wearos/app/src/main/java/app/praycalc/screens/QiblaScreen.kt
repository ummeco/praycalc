package app.praycalc.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.*

@Composable
fun QiblaScreen(bearing: Float) {
    val green = Color(0xFF79C24C)
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Qibla",
            style = MaterialTheme.typography.title3,
            color = green
        )
        Spacer(Modifier.height(8.dp))
        Box(contentAlignment = Alignment.Center, modifier = Modifier.size(120.dp)) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val cx = size.width / 2
                val cy = size.height / 2
                val r = size.minDimension / 2 - 8.dp.toPx()
                drawCircle(color = Color(0xFF1E5E2F), radius = r, center = Offset(cx, cy))
                rotate(bearing, pivot = Offset(cx, cy)) {
                    drawLine(
                        color = green,
                        start = Offset(cx, cy),
                        end = Offset(cx, cy - r + 4.dp.toPx()),
                        strokeWidth = 4.dp.toPx()
                    )
                }
            }
        }
        Spacer(Modifier.height(8.dp))
        Text(
            text = "${bearing.toInt()}°",
            fontSize = 20.sp,
            color = Color.White
        )
        Text(
            text = "toward Mecca",
            style = MaterialTheme.typography.caption2,
            color = Color(0xFF79C24C)
        )
    }
}
