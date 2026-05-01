<?php
// api.php - Backend API
header('Content-Type: application/json');
require_once 'config.php';

$action = $_GET['action'] ?? '';
$db = getDB();

try {
    switch ($action) {
        case 'get_profile':
            $stmt = $db->query("SELECT * FROM business_profile WHERE id = 1");
            echo json_encode($stmt->fetch());
            break;

        case 'update_profile':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $db->prepare("UPDATE business_profile SET name=?, owner_name=?, address=?, phone=?, email=?, logo=? WHERE id=1");
            $stmt->execute([$data['name'], $data['ownerName'], $data['address'], $data['phone'], $data['email'], $data['logo'] ?? '']);
            echo json_encode(['success' => true]);
            break;

        case 'get_clients':
            $stmt = $db->query("SELECT * FROM clients ORDER BY name ASC");
            echo json_encode($stmt->fetchAll());
            break;

        case 'add_client':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $db->prepare("INSERT INTO clients (name, company, address, phone, email) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$data['name'], $data['company'], $data['address'], $data['phone'], $data['email']]);
            echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
            break;

        case 'get_documents':
            $stmt = $db->query("SELECT d.*, c.name as client_name, c.company as client_company 
                               FROM documents d 
                               LEFT JOIN clients c ON d.client_id = c.id 
                               ORDER BY d.created_at DESC");
            echo json_encode($stmt->fetchAll());
            break;

        case 'get_document':
            $id = $_GET['id'] ?? '';
            $stmt = $db->prepare("SELECT * FROM documents WHERE id = ?");
            $stmt->execute([$id]);
            $doc = $stmt->fetch();
            
            if ($doc) {
                // Get Items
                $stmt = $db->prepare("SELECT * FROM document_items WHERE document_id = ?");
                $stmt->execute([$id]);
                $doc['items'] = $stmt->fetchAll();
                
                // Get Sections
                $stmt = $db->prepare("SELECT * FROM document_sections WHERE document_id = ? ORDER BY sort_order ASC");
                $stmt->execute([$id]);
                $doc['sections'] = $stmt->fetchAll();
            }
            echo json_encode($doc);
            break;

        case 'save_document':
            $data = json_decode(file_get_contents('php://input'), true);
            $db->beginTransaction();

            // Upsert Document
            $stmt = $db->prepare("INSERT INTO documents (id, type, doc_number, date, due_date, client_id, opening, closing, notes, terms, subtotal, tax, discount, total) 
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                 ON DUPLICATE KEY UPDATE 
                                 type=VALUES(type), doc_number=VALUES(doc_number), date=VALUES(date), due_date=VALUES(due_date), client_id=VALUES(client_id), 
                                 opening=VALUES(opening), closing=VALUES(closing), notes=VALUES(notes), terms=VALUES(terms), 
                                 subtotal=VALUES(subtotal), tax=VALUES(tax), discount=VALUES(discount), total=VALUES(total)");
            
            $stmt->execute([
                $data['id'], $data['type'], $data['docNumber'], $data['date'], $data['dueDate'] ?? null, 
                $data['clientId'], $data['opening'], $data['closing'], $data['notes'], $data['terms'],
                $data['subtotal'], $data['tax'], $data['discount'], $data['total']
            ]);

            // Clear and Insert Items
            $db->prepare("DELETE FROM document_items WHERE document_id = ?")->execute([$data['id']]);
            $stmtItem = $db->prepare("INSERT INTO document_items (id, document_id, description, specifications, quantity, unit, price, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            foreach ($data['items'] as $item) {
                $stmtItem->execute([$item['id'], $data['id'], $item['description'], $item['specifications'], $item['quantity'], $item['unit'], $item['price'], $item['total']]);
            }

            // Clear and Insert Sections
            $db->prepare("DELETE FROM document_sections WHERE document_id = ?")->execute([$data['id']]);
            if (isset($data['sections']) && is_array($data['sections'])) {
                $stmtSec = $db->prepare("INSERT INTO document_sections (id, document_id, title, content, sort_order) VALUES (?, ?, ?, ?, ?)");
                foreach ($data['sections'] as $idx => $sec) {
                    $stmtSec->execute([$sec['id'], $data['id'], $sec['title'], $sec['content'], $idx]);
                }
            }

            $db->commit();
            echo json_encode(['success' => true]);
            break;

        case 'delete_document':
            $id = $_GET['id'] ?? '';
            $stmt = $db->prepare("DELETE FROM documents WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
            break;

        default:
            echo json_encode(['error' => 'Aksi tidak dikenal']);
            break;
    }
} catch (Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    echo json_encode(['error' => $e->getMessage()]);
}
?>
