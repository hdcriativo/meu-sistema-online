"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Search, MessageSquare, Phone, Video, MoreVertical } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { mockUsers } from "@/lib/mock-data"
import type { ChatMessage, User } from "@/lib/types"

// Mock data para mensagens
const mockMessages: ChatMessage[] = [
  {
    id: "1",
    fromUserId: "2",
    toUserId: "1",
    message: "Bom dia! O orçamento da Construtora ABC foi aprovado. Podemos agendar a entrega?",
    type: "text",
    isGroup: false,
    createdAt: new Date("2024-03-25T08:30:00"),
    readAt: new Date("2024-03-25T08:35:00"),
  },
  {
    id: "2",
    fromUserId: "1",
    toUserId: "2",
    message: "Ótima notícia! Vou verificar a disponibilidade da frota e te retorno.",
    type: "text",
    isGroup: false,
    createdAt: new Date("2024-03-25T08:40:00"),
    readAt: new Date("2024-03-25T08:41:00"),
  },
  {
    id: "3",
    fromUserId: "3",
    toUserId: "1",
    message: "Entrega da obra Central concluída com sucesso! Cliente muito satisfeito.",
    type: "text",
    isGroup: false,
    createdAt: new Date("2024-03-25T10:30:00"),
  },
  {
    id: "4",
    fromUserId: "1",
    toUserId: "3",
    message: "Excelente trabalho, Carlos! Obrigado pelo feedback.",
    type: "text",
    isGroup: false,
    createdAt: new Date("2024-03-25T10:35:00"),
  },
]

export default function ChatPage() {
  const { user } = useAuth()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  if (!user) return null

  // Filtrar usuários (excluir o usuário atual)
  const otherUsers = mockUsers.filter((u) => u.id !== user.id)

  // Filtrar mensagens para o usuário selecionado
  const conversationMessages = selectedUser
    ? mockMessages.filter(
        (msg) =>
          (msg.fromUserId === user.id && msg.toUserId === selectedUser.id) ||
          (msg.fromUserId === selectedUser.id && msg.toUserId === user.id),
      )
    : []

  // Obter última mensagem para cada usuário
  const getUserLastMessage = (userId: string) => {
    const userMessages = mockMessages.filter(
      (msg) =>
        (msg.fromUserId === user.id && msg.toUserId === userId) ||
        (msg.fromUserId === userId && msg.toUserId === user.id),
    )
    return userMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
  }

  // Contar mensagens não lidas
  const getUnreadCount = (userId: string) => {
    return mockMessages.filter((msg) => msg.fromUserId === userId && msg.toUserId === user.id && !msg.readAt).length
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return

    console.log("Enviando mensagem:", {
      fromUserId: user.id,
      toUserId: selectedUser.id,
      message: newMessage,
      type: "text",
      isGroup: false,
    })

    setNewMessage("")
  }

  const filteredUsers = otherUsers.filter((u) => u.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <AppLayout>
      <div className="h-[calc(100vh-2rem)] m-4">
        <div className="flex h-full bg-background border border-border rounded-lg overflow-hidden">
          {/* Sidebar - Lista de Usuários */}
          <div className="w-80 border-r border-border flex flex-col">
            <div className="p-4 border-b border-border">
              <h1 className="text-xl font-bold mb-4">Chat Interno</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar contatos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2">
                {filteredUsers.map((contact) => {
                  const lastMessage = getUserLastMessage(contact.id)
                  const unreadCount = getUnreadCount(contact.id)

                  return (
                    <div
                      key={contact.id}
                      onClick={() => setSelectedUser(contact)}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUser?.id === contact.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {contact.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground truncate">{contact.name}</p>
                          {lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {new Intl.DateTimeFormat("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              }).format(new Date(lastMessage.createdAt))}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate capitalize">{contact.role}</p>
                          {unreadCount > 0 && (
                            <Badge
                              variant="destructive"
                              className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                            >
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                        {lastMessage && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {lastMessage.fromUserId === user.id ? "Você: " : ""}
                            {lastMessage.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Área de Chat */}
          <div className="flex-1 flex flex-col">
            {selectedUser ? (
              <>
                {/* Header do Chat */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {selectedUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold text-foreground">{selectedUser.name}</h2>
                      <p className="text-sm text-muted-foreground capitalize">{selectedUser.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Mensagens */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {conversationMessages.map((message) => {
                      const isFromCurrentUser = message.fromUserId === user.id
                      const messageUser = mockUsers.find((u) => u.id === message.fromUserId)

                      return (
                        <div key={message.id} className={`flex ${isFromCurrentUser ? "justify-end" : "justify-start"}`}>
                          <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md`}>
                            {!isFromCurrentUser && (
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {messageUser?.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`px-3 py-2 rounded-lg ${
                                isFromCurrentUser
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <p className="text-sm">{message.message}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isFromCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground/70"
                                }`}
                              >
                                {new Intl.DateTimeFormat("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }).format(new Date(message.createdAt))}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>

                {/* Input de Mensagem */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* Estado Vazio */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Selecione uma conversa</h3>
                  <p className="text-muted-foreground">Escolha um contato para começar a conversar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
