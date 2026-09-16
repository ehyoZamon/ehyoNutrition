package com.ehyonutrition.app;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    WindowCompat.setDecorFitsSystemWindows(getWindow(), false); // контент едет под ОБА бара
    getWindow().setStatusBarColor(Color.TRANSPARENT);
    getWindow().setNavigationBarColor(Color.TRANSPARENT);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      // без этого Android сам подмешивает тёмный scrim под нижний бар для контраста —
      // из-за него ваш rgba(254,254,254,0.8) будет выглядеть темнее, чем задумано
      getWindow().setNavigationBarContrastEnforced(false);
    }
  }
}