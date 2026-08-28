package com.rescatandomascotas.app;

import android.os.Bundle;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Inicializa el Splash Screen antes de onCreate
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);
    }
}
