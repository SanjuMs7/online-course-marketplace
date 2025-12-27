from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0004_course_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='lesson',
            name='description',
            field=models.TextField(blank=True, default=''),
        ),
    ]
