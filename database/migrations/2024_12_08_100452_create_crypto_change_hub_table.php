<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCryptoChangeHubTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
{
    Schema::create('order_items', function (Blueprint $table) {
        $table->id();  // 項目 ID
        $table->foreignId('order_id')->constrained()->onDelete('cascade');  // 外鍵，指向 orders 表
        $table->string('product_name');  // 商品名稱
        $table->integer('quantity');  // 商品數量
        $table->decimal('unit_price', 10, 2);  // 單價
        $table->decimal('total_price', 10, 2);  // 總價
        $table->timestamps();  // created_at 和 updated_at
    });
}


    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('cryptoChangeHub');
    }
}
