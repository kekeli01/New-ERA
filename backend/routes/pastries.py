"""
Pastries Catalog Routes
⭐ IMPORTANT: Browse pastries by category
"""

from flask import Blueprint, request, jsonify
from models import db, Pastry, Category
from auth import require_admin_auth

pastries_bp = Blueprint('pastries', __name__)

# ==================== PUBLIC ENDPOINTS ====================

@pastries_bp.route('', methods=['GET'])
def get_pastries():
    """
    ⭐ IMPORTANT: Get all pastries with optional filtering
    Query params:
        - category_id: Filter by category
        - page: Pagination (default 1)
        - limit: Items per page (default 20)
    Response: { "pastries": [...], "total": 50, "pages": 3 }
    """
    category_id = request.args.get('category_id', type=int)
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    
    query = Pastry.query
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    # Only return in-stock items for customers
    query = query.filter(Pastry.in_stock > 0)
    
    total = query.count()
    pastries = query.paginate(page=page, per_page=limit).items
    
    return jsonify({
        'pastries': [p.to_dict() for p in pastries],
        'total': total,
        'page': page,
        'pages': (total + limit - 1) // limit
    }), 200

@pastries_bp.route('/<int:pastry_id>', methods=['GET'])
def get_pastry(pastry_id):
    """
    ⭐ IMPORTANT: Get single pastry details
    Response: { "pastry": {...} }
    """
    pastry = Pastry.query.get(pastry_id)
    
    if not pastry:
        return jsonify({'error': 'Pastry not found'}), 404
    
    return jsonify({'pastry': pastry.to_dict()}), 200

@pastries_bp.route('/categories', methods=['GET'])
def get_categories():
    """
    ⭐ IMPORTANT: Get all categories (Cakes, Cookies, Bread, Seasonal)
    Response: { "categories": [...] }
    """
    categories = Category.query.all()
    
    return jsonify({
        'categories': [c.to_dict() for c in categories]
    }), 200

# ==================== ADMIN ENDPOINTS ====================

@pastries_bp.route('', methods=['POST'])
@require_admin_auth
def create_pastry():
    """
    ⭐ IMPORTANT: Create new pastry (Admin only)
    Request: { "name": "Chocolate Cake", "price": 45.00, "category_id": 1, "image_url": "...", "in_stock": 10 }
    Response: { "success": true, "pastry": {...} }
    """
    data = request.get_json()
    
    required_fields = ['name', 'price', 'category_id', 'in_stock']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # ⭐ IMPORTANT: Verify category exists
    category = Category.query.get(data['category_id'])
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    pastry = Pastry(
        name=data['name'],
        description=data.get('description'),
        price=data['price'],
        category_id=data['category_id'],
        image_url=data.get('image_url'),
        in_stock=data['in_stock'],
        min_stock_alert=data.get('min_stock_alert', 5)
    )
    
    db.session.add(pastry)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Pastry created successfully',
        'pastry': pastry.to_dict()
    }), 201

@pastries_bp.route('/<int:pastry_id>', methods=['PUT'])
@require_admin_auth
def update_pastry(pastry_id):
    """
    ⭐ IMPORTANT: Update pastry details (Admin only)
    Request: { "name": "...", "price": 50.00, "in_stock": 15 }
    Response: { "success": true, "pastry": {...} }
    """
    pastry = Pastry.query.get(pastry_id)
    
    if not pastry:
        return jsonify({'error': 'Pastry not found'}), 404
    
    data = request.get_json()
    
    # ⭐ IMPORTANT: Update only provided fields
    if 'name' in data:
        pastry.name = data['name']
    if 'description' in data:
        pastry.description = data['description']
    if 'price' in data:
        pastry.price = data['price']
    if 'category_id' in data:
        category = Category.query.get(data['category_id'])
        if not category:
            return jsonify({'error': 'Category not found'}), 404
        pastry.category_id = data['category_id']
    if 'image_url' in data:
        pastry.image_url = data['image_url']
    if 'min_stock_alert' in data:
        pastry.min_stock_alert = data['min_stock_alert']
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Pastry updated successfully',
        'pastry': pastry.to_dict()
    }), 200

@pastries_bp.route('/<int:pastry_id>', methods=['DELETE'])
@require_admin_auth
def delete_pastry(pastry_id):
    """
    ⭐ IMPORTANT: Delete pastry (Admin only)
    Response: { "success": true, "message": "..." }
    """
    pastry = Pastry.query.get(pastry_id)
    
    if not pastry:
        return jsonify({'error': 'Pastry not found'}), 404
    
    db.session.delete(pastry)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Pastry deleted successfully'
    }), 200

@pastries_bp.route('/stock/<int:pastry_id>', methods=['PATCH'])
@require_admin_auth
def update_stock(pastry_id):
    """
    ⭐ IMPORTANT: Manually adjust stock (Admin only)
    Request: { "qty": 10, "reason": "manual_adjustment" }
    Response: { "success": true, "pastry": {...} }
    Note: Stock auto-reduces when order status → "baking" via stored procedure
    """
    pastry = Pastry.query.get(pastry_id)
    
    if not pastry:
        return jsonify({'error': 'Pastry not found'}), 404
    
    data = request.get_json()
    
    if 'qty' not in data:
        return jsonify({'error': 'Quantity required'}), 400
    
    old_stock = pastry.in_stock
    pastry.in_stock = data['qty']
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': f'Stock updated from {old_stock} to {data["qty"]}',
        'pastry': pastry.to_dict()
    }), 200
