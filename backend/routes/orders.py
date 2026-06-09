"""
Orders Management Routes
⭐ IMPORTANT: Handles order creation, tracking, and stock reduction on baking status
"""

from flask import Blueprint, request, jsonify
from models import db, Order, OrderItem, Pastry, Customer, Notification, StockHistory
from auth import require_customer_auth, require_admin_auth
from datetime import datetime

orders_bp = Blueprint('orders', __name__)

# ==================== CUSTOMER ENDPOINTS ====================

@orders_bp.route('', methods=['POST'])
@require_customer_auth
def create_order():
    """
    ⭐ IMPORTANT: Create new order
    Request: {
        "items": [{"pastry_id": 1, "qty": 2}, {"pastry_id": 2, "qty": 1}],
        "delivery_type": "delivery",
        "payment_method": "mtn_momo",
        "delivery_address": "123 Main St",
        "delivery_zone": "Zone A (Central)"
    }
    Response: { "success": true, "order": {...} }
    
    Flow: Create order → Send confirmation notification → Calculate total with delivery_fee
    """
    customer = request.customer
    data = request.get_json()
    
    items = data.get('items', [])
    delivery_type = data.get('delivery_type', 'pickup')
    payment_method = data.get('payment_method', 'pay_on_pickup')
    delivery_address = data.get('delivery_address')
    delivery_zone = data.get('delivery_zone')
    
    if not items:
        return jsonify({'error': 'Order must contain items'}), 400
    
    # ⭐ IMPORTANT: Calculate totals and validate stock
    subtotal = 0
    order_items_data = []
    
    for item in items:
        pastry = Pastry.query.get(item['pastry_id'])
        
        if not pastry:
            return jsonify({'error': f'Pastry {item["pastry_id"]} not found'}), 404
        
        if pastry.in_stock < item['qty']:
            return jsonify({'error': f'{pastry.name} has only {pastry.in_stock} in stock'}), 400
        
        item_subtotal = float(pastry.price) * item['qty']
        subtotal += item_subtotal
        
        order_items_data.append({
            'pastry': pastry,
            'qty': item['qty'],
            'price_at_order': float(pastry.price),
            'subtotal': item_subtotal
        })
    
    # ⭐ IMPORTANT: Calculate delivery fee based on zone
    delivery_fee = 0
    if delivery_type == 'delivery':
        from config import Config
        delivery_fee = Config.DELIVERY_FEES.get(delivery_zone, 0)
    
    total = subtotal + delivery_fee
    
    # Create order
    order = Order(
        customer_id=customer.id,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        total=total,
        delivery_type=delivery_type,
        payment_method=payment_method,
        delivery_address=delivery_address if delivery_type == 'delivery' else None,
        status='pending',
        order_channel='website'
    )
    
    db.session.add(order)
    db.session.flush()  # Generate order ID
    
    # Add order items
    for item_data in order_items_data:
        order_item = OrderItem(
            order_id=order.id,
            pastry_id=item_data['pastry'].id,
            qty=item_data['qty'],
            price_at_order=item_data['price_at_order'],
            subtotal=item_data['subtotal']
        )
        db.session.add(order_item)
    
    db.session.commit()
    
    # ⭐ TODO: Send order confirmation notification
    # notification = Notification(
    #     customer_id=customer.id,
    #     order_id=order.id,
    #     notification_type='order_confirmation',
    #     channel='whatsapp',
    #     message=f"Your order #{order.id} for GHS {total:.2f} has been received!"
    # )
    # db.session.add(notification)
    # db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Order created successfully',
        'order': order.to_dict()
    }), 201

@orders_bp.route('/<int:order_id>', methods=['GET'])
@require_customer_auth
def get_order(order_id):
    """
    ⭐ IMPORTANT: Get order details for tracking
    Response: { "order": {...} }
    """
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    # ⭐ Security: Customer can only view their own orders
    if order.customer_id != request.customer.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify({'order': order.to_dict()}), 200

@orders_bp.route('', methods=['GET'])
@require_customer_auth
def get_customer_orders():
    """
    ⭐ IMPORTANT: Get customer's order history
    Response: { "orders": [...], "total": 5 }
    """
    customer = request.customer
    orders = Order.query.filter_by(customer_id=customer.id).order_by(Order.created_at.desc()).all()
    
    return jsonify({
        'orders': [o.to_dict() for o in orders],
        'total': len(orders)
    }), 200

# ==================== ADMIN ENDPOINTS ====================

@orders_bp.route('/admin/all', methods=['GET'])
@require_admin_auth
def get_all_orders():
    """
    ⭐ IMPORTANT: Get all orders with filtering and status
    Query params:
        - status: Filter by order status (pending, baking, ready, delivered, picked_up)
        - page: Pagination
    Response: { "orders": [...], "total": 100, "pages": 5 }
    """
    status = request.args.get('status')
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    
    query = Order.query.order_by(Order.created_at.desc())
    
    if status:
        query = query.filter_by(status=status)
    
    total = query.count()
    orders = query.paginate(page=page, per_page=limit).items
    
    return jsonify({
        'orders': [o.to_dict() for o in orders],
        'total': total,
        'page': page,
        'pages': (total + limit - 1) // limit
    }), 200

@orders_bp.route('/admin/<int:order_id>/status', methods=['PATCH'])
@require_admin_auth
def update_order_status(order_id):
    """
    ⭐ IMPORTANT: Update order status
    Request: { "status": "baking" }
    Response: { "success": true, "order": {...} }
    
    ⭐ CRITICAL: When status → "baking", automatically reduce in_stock!
    This triggers the stock reduction procedure:
    1. For each OrderItem in the order
    2. Reduce pastry.in_stock by qty
    3. Log change to stock_history table
    """
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    data = request.get_json()
    new_status = data.get('status')
    
    if not new_status:
        return jsonify({'error': 'Status required'}), 400
    
    old_status = order.status
    order.status = new_status
    
    # ⭐ CRITICAL: Auto-reduce stock when status → "baking"
    if new_status == 'baking' and old_status != 'baking':
        for order_item in order.items:
            pastry = order_item.pastry
            old_stock = pastry.in_stock
            pastry.in_stock -= order_item.qty
            
            # Log to stock history
            stock_log = StockHistory(
                pastry_id=pastry.id,
                old_stock=old_stock,
                new_stock=pastry.in_stock,
                change_reason='baking_order',
                order_id=order.id
            )
            db.session.add(stock_log)
    
    # Mark as delivered/picked_up with timestamp
    if new_status in ['delivered', 'picked_up']:
        order.delivered_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': f'Order status updated to {new_status}',
        'order': order.to_dict()
    }), 200

@orders_bp.route('/admin/<int:order_id>', methods=['DELETE'])
@require_admin_auth
def cancel_order(order_id):
    """
    ⭐ IMPORTANT: Cancel order
    Response: { "success": true, "message": "..." }
    """
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    if order.status == 'delivered' or order.status == 'picked_up':
        return jsonify({'error': 'Cannot cancel completed orders'}), 400
    
    order.status = 'cancelled'
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Order cancelled successfully'
    }), 200
