using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HabitosApp.Migrations
{
    /// <inheritdoc />
    public partial class AgregarRecordUsoSolo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RecordUso",
                table: "Usuarios",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RecordUso",
                table: "Usuarios");
        }
    }
}
