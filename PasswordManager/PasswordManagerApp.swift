import SwiftUI
import LocalAuthentication

@main
struct PasswordManagerApp: App {
    @StateObject private var passwordStore = PasswordStore()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(passwordStore)
        }
        .windowStyle(.hiddenTitleBar)
        .windowResizability(.contentSize)
    }
}
