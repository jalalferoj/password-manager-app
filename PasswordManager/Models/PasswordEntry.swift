import Foundation

struct PasswordEntry: Identifiable, Codable, Equatable {
    let id: UUID
    var title: String
    var username: String
    var password: String
    var createdAt: Date
    
    init(id: UUID = UUID(), title: String, username: String, password: String) {
        self.id = id
        self.title = title
        self.username = username
        self.password = password
        self.createdAt = Date()
    }
}
