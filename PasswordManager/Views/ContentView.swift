import SwiftUI
import LocalAuthentication

struct ContentView: View {
    @EnvironmentObject private var passwordStore: PasswordStore
    @State private var isAuthenticated = false
    @State private var showingAddPassword = false
    @State private var searchText = ""
    
    var filteredPasswords: [PasswordEntry] {
        if searchText.isEmpty {
            return passwordStore.passwords
        }
        return passwordStore.passwords.filter { password in
            password.title.localizedCaseInsensitiveContains(searchText) ||
            password.username.localizedCaseInsensitiveContains(searchText)
        }
    }
    
    var body: some View {
        Group {
            if !isAuthenticated {
                AuthenticationView(isAuthenticated: $isAuthenticated)
            } else {
                NavigationView {
                    List {
                        ForEach(filteredPasswords) { password in
                            PasswordRowView(password: password)
                        }
                        .onDelete(perform: deletePasswords)
                    }
                    .navigationTitle("Password Manager")
                    .searchable(text: $searchText, prompt: "Search passwords")
                    .toolbar {
                        ToolbarItem(placement: .primaryAction) {
                            Button(action: { showingAddPassword.toggle() }) {
                                Label("Add Password", systemImage: "plus")
                            }
                        }
                        ToolbarItem(placement: .automatic) {
                            Button(action: lock) {
                                Label("Lock", systemImage: "lock")
                            }
                        }
                    }
                }
                .sheet(isPresented: $showingAddPassword) {
                    AddPasswordView()
                }
            }
        }
    }
    
    private func deletePasswords(at offsets: IndexSet) {
        passwordStore.deletePasswords(at: offsets)
    }
    
    private func lock() {
        isAuthenticated = false
    }
}
