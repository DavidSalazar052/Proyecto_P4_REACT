-- 1. Inserta el usuario admin solo si no existe ese username
INSERT INTO usuario (username, clave, tipo)
SELECT 'admin', '$2a$10$Jr8a7/FFtYiE/dOsoDim/u3t1bSosLLO86bx6SXMwGZSmQDyV.m6G', 'ADM'
    WHERE NOT EXISTS (
    SELECT 1 FROM usuario WHERE username = 'admin'
);

-- 2. Inserta el administrador vinculado al usuario recién creado (o ya existente)
INSERT INTO administrador (usuario_id, identificacion, nombre, correo)
SELECT id, '000000000', 'Administrador', 'admin@bolsaempleo.local'
FROM usuario
WHERE username = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM administrador
    WHERE usuario_id = (SELECT id FROM usuario WHERE username = 'admin')
);